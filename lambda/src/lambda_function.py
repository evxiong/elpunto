import csv
import json
import logging
import os
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from typing import Any

import boto3
import feedparser
import html2text
import pandas as pd
from bertopic import BERTopic
from bertopic.representation import KeyBERTInspired
from dateutil import parser, tz
from feedparser import FeedParserDict
from openai import OpenAI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering


@dataclass
class Article:
    link: str  # link to article
    timestamp: str  # time of feed collection
    source_name: str  # article source
    pub_date: str  # stringified datetime in UTC
    title: str  # article title
    description: str  # article description


class Category(StrEnum):
    US = "U.S."
    WORLD = "World"
    POLITICS = "Politics"
    BUSINESS = "Business"
    TECH = "Tech"
    SPORTS = "Sports"
    ENTERTAINMENT = "Entertainment"
    SCIENCE = "Science"
    HEALTH = "Health"


class GPTResponse(BaseModel):
    category: Category
    topic: str
    summary: str
    excluded_indices: list[int]


def get_env(name: str):
    var = os.getenv(name)
    if var is None:
        raise Exception(f"{name} env var not set")
    return var


def get_schedule() -> list[int]:
    """Parse, validate, and sort `SCHEDULE` env var.

    Returns:
        list[int]: schedule parsed as list of integers representing HHMM times,
            sorted in ascending order.
    """
    schedule = get_env("SCHEDULE")

    if not (schedule.strip().startswith("[") and schedule.strip().endswith("]")):
        raise Exception("SCHEDULE env var is not an array")

    def str_to_int(s: str) -> int:
        try:
            return int(s)
        except ValueError:
            raise Exception(f"SCHEDULE env var contains invalid time: {s}")

    schedule = [str_to_int(t.strip()) for t in (schedule.strip()[1:-1]).split(",")]

    if len(schedule) == 0:
        raise Exception("SCHEDULE env var is empty")

    for time in schedule:
        if time < 0 or time > 2359 or time % 100 > 59:
            raise Exception(f"SCHEDULE env var contains invalid time: {time}")

    return sorted(schedule)


def generate_timestamps() -> tuple[str, int]:
    """Generate PK timestamp and TTL expiration timestamp for db.

    PK timestamp is rounded down (or up, if within `SCHEDULE_BUFFER`) to nearest
    `SCHEDULE` time. Expiration timestamp is 1 day after PK timestamp for
    auto-deletion.

    Actual Lambda runs `SCHEDULE_BUFFER` min before each `SCHEDULE` time to
    ensure smooth updates for users.

    Returns:
        tuple[str, int]: where str is ISO 8601 update timestamp, and int
            is Unix expiration timestamp.
    """

    def subtract_from_hhmm(hhmm: int, amount: int):
        # convert hhmm to total minutes since midnight
        hours = hhmm // 100
        minutes = hhmm % 100
        total_minutes = hours * 60 + minutes

        res_total_minutes = (total_minutes - amount) % 1440
        res_hours = res_total_minutes // 60
        res_minutes = res_total_minutes % 60
        return res_hours * 100 + res_minutes

    schedule = get_schedule()
    buffer = int(get_env("SCHEDULE_BUFFER"))
    now = datetime.now(timezone.utc)
    now_hhmm = now.hour * 100 + now.minute

    # 2 cases:
    #   1. schedule[0]-buffer interval does not cross 0000 (and 2400)
    #      - subtract buffer from each schedule time, use as new schedule
    #      - if current time before earliest schedule time, set timestamp to
    #        prev day schedule[n-1]+buffer
    #      - if current time between schedule times or after latest schedule
    #        time, set timestamp to schedule[i]+buffer
    #   2. schedule[0]-buffer interval crosses 0000
    #      - subtract buffer from each schedule time, re-sort, use as new
    #        schedule
    #      - if current time before earliest schedule time, set timestamp to
    #        same day schedule[n-1]+buffer (addition should wraparound)
    #      - if current time after latest schedule time, set timestamp to next
    #        day schedule[n-1]+buffer (addition should wraparound)
    #      - if current time between schedule times, set timestamp to
    #        schedule[i]+buffer

    cross = True if schedule[0] < subtract_from_hhmm(schedule[0], buffer) else False
    buffered_schedule = sorted([subtract_from_hhmm(t, buffer) for t in schedule])
    if not cross:
        if now_hhmm < buffered_schedule[0]:
            now = now - timedelta(days=1)
            prev_day_hhmm = subtract_from_hhmm(buffered_schedule[-1], -buffer)
            now = now.replace(
                hour=prev_day_hhmm // 100, minute=prev_day_hhmm % 100, second=0
            )
        else:
            for i in range(len(buffered_schedule)):
                if now_hhmm >= buffered_schedule[i] and (
                    i + 1 == len(buffered_schedule)
                    or now_hhmm < buffered_schedule[i + 1]
                ):
                    cur_day_hhmm = subtract_from_hhmm(buffered_schedule[i], -buffer)
                    now = now.replace(
                        hour=cur_day_hhmm // 100, minute=cur_day_hhmm % 100, second=0
                    )
                    break
    else:
        if now_hhmm < buffered_schedule[0]:
            cur_day_hhmm = subtract_from_hhmm(buffered_schedule[-1], -buffer)
            now = now.replace(
                hour=cur_day_hhmm // 100, minute=cur_day_hhmm % 100, second=0
            )
        elif now_hhmm >= buffered_schedule[-1]:
            now = now + timedelta(days=1)
            next_day_hhmm = subtract_from_hhmm(buffered_schedule[-1], -buffer)
            now = now.replace(
                hour=next_day_hhmm // 100, minute=next_day_hhmm % 100, second=0
            )
        else:
            for i in range(len(buffered_schedule) - 1):
                if (
                    now_hhmm >= buffered_schedule[i]
                    and now_hhmm < buffered_schedule[i + 1]
                ):
                    cur_day_hhmm = subtract_from_hhmm(buffered_schedule[i], -buffer)
                    now = now.replace(
                        hour=cur_day_hhmm // 100, minute=cur_day_hhmm % 100, second=0
                    )
                    break

    timestamp = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    expire_at = int((now + timedelta(days=1)).timestamp())

    return timestamp, expire_at


def collect_feeds(file_path: str = "feeds.csv") -> list[Article]:
    """Collect articles from RSS feeds in file_path.

    CSV file must have at least two columns: `name`, the source's name; and
    `feed`, the URL of the source's RSS feed.

    Args:
        file_path (str, optional): path to CSV file. Defaults to `feeds.csv`.

    Returns:
        list[Article]: flat list of all articles from all feeds.
    """
    with open(file_path, encoding="utf-8") as fd:
        reader = csv.DictReader(fd)
        sources = list(reader)

    rss_links = [source["feed"] for source in sources]

    print("Parsing RSS feeds...", end="", flush=True)
    feeds: list[FeedParserDict] = [feedparser.parse(link) for link in rss_links]

    h = html2text.HTML2Text()
    h.ignore_links = True
    h.emphasis_mark = ""
    h.strong_mark = ""
    h.ignore_images = True
    h.ignore_emphasis = True

    eastern = tz.gettz("US/Eastern")
    tzinfos = {"EDT": eastern, "EST": eastern}
    exclude_descriptions = {"ProPublica", "r/news", "Reuters"}
    current_time = datetime.now(timezone.utc)

    articles = []
    for i, source in enumerate(sources):
        source_links: set[str] = set()
        source_titles: set[str] = set()
        for entry in feeds[i]["entries"]:
            article_link: str = entry.link  # type: ignore
            article_title = " ".join(
                re.sub(
                    r"-\s+Reuters(.|\n)*",
                    "",
                    h.handle(entry.get("title", "")),  # type: ignore
                ).split()
            )
            if (
                article_link not in source_links
                and article_title not in source_titles
                and ("published" in entry or "updated" in entry)
                and (
                    "source" not in entry
                    or entry.source.href == "https://www.reuters.com"  # type: ignore
                )
            ):
                date_string: str = (  # type: ignore
                    entry.updatedate
                    if "updatedate" in entry
                    else entry.updated
                    if "updated" in entry
                    else entry.published
                )

                # Pre-processing: exclude any articles over 2 days old.
                if (
                    date_string
                    and (
                        current_time
                        - parser.parse(date_string, tzinfos=tzinfos).astimezone(tz.UTC)
                    ).days
                    < 2
                ):
                    articles.append(
                        Article(
                            link=article_link,
                            timestamp=str(current_time),
                            source_name=source["name"],
                            pub_date=str(
                                parser.parse(date_string, tzinfos=tzinfos).astimezone(
                                    tz.UTC
                                )
                            ),
                            title=article_title,
                            description=(
                                " ".join(
                                    h.handle(entry.get("summary", "")).split()[:75]  # type: ignore
                                )
                                if source["name"] not in exclude_descriptions
                                else ""
                            ),
                        )
                    )

                    source_links.add(article_link)
                    source_titles.add(article_title)

    print("DONE")
    return articles


def cluster(headlines: list[str]) -> BERTopic:
    """Cluster headlines using BERTopic.

    Args:
        headlines (list[str]): list of article title + up to first 75 words of
            article description

    Returns:
        BERTopic: BERTopic model fitted on the headlines (after clustering and
            topic generation).
    """
    cluster_model = AgglomerativeClustering(n_clusters=None, distance_threshold=1.5)
    embedding_model = SentenceTransformer("./all-MiniLM-L6-v2")
    topic_model = BERTopic(
        embedding_model=embedding_model,
        hdbscan_model=cluster_model,  # type: ignore
        representation_model=KeyBERTInspired(),
    )
    topic_model.fit_transform(headlines)
    return topic_model


def get_representative_articles(
    articles: list[Article], topic_model: BERTopic, n: int
) -> dict[int, list[Article]]:
    """Get n most representative articles of each cluster.

    Args:
        articles (list[Article]): flat list of all articles from all feeds.
        topic_model (BERTopic): fitted BERTopic model.
        n (int): number of desired representative articles.

    Returns:
        dict[int, list[Article]]: topic id -> list of n most representative
            articles.
    """
    documents = pd.DataFrame(
        {
            "Document": [a.title for a in articles],
            "ID": range(len(articles)),
            "Topic": topic_model.topics_,
        }
    )

    res: tuple[dict[int, list[str]], Any, Any, list[list[int]]] = (
        topic_model._extract_representative_docs(
            c_tf_idf=topic_model.c_tf_idf_,  # type: ignore
            documents=documents,
            topics=topic_model.topic_representations_,  # type: ignore
            nr_repr_docs=n,
        )
    )
    repr_docs_map, _, _, repr_docs_ids = res
    # repr_docs_map: dict[int, list[str]]: topic id -> list of titles
    # repr_docs_ids: list[list[int]]: repr_docs_ids[i] is list of article
    #   indices that belong to topic i

    topic_to_repr_articles: dict[int, list[Article]] = {}

    for topic_id in repr_docs_map.keys():
        repr_docs = [articles[article_ind] for article_ind in repr_docs_ids[topic_id]]
        repr_docs.sort(key=lambda a: a.pub_date, reverse=True)
        topic_to_repr_articles[topic_id] = repr_docs

    return topic_to_repr_articles


def score_clusters(articles: list[Article], topic_model: BERTopic) -> list[int]:
    """Score clusters based on diversity of sources.

    Top headlines are determined by sorting clusters by their scores. Each
    article in a cluster contributes 1 point, up to 4 points from the same
    source. This is to adjust for spam from one source (especially for sports
    news).

    Args:
        articles (list[Article]): flat list of all articles from all feeds.
        topic_model (BERTopic): fitted BERTopic model.

    Returns:
        list[int]: list of topic ids, sorted from highest to lowest score.
    """
    # topic id -> list of article indices belonging to topic
    grouped_topics: dict[int, list[int]] = defaultdict(list)
    for article_ind, topic in enumerate(topic_model.topics_):  # type: ignore
        grouped_topics[topic].append(article_ind)  # type: ignore

    scores: list[tuple[int, int]] = []  # list of (topic id, score)
    topic_id = 0
    num_topics = (
        len(grouped_topics) if -1 not in grouped_topics else len(grouped_topics) - 1
    )
    for topic_id in range(num_topics):
        topic_score = 0
        cur_source = None
        cur_count = 0
        for article_ind in grouped_topics[topic_id]:
            if cur_count < 4:
                topic_score += 1

            if cur_source != articles[article_ind].source_name:
                cur_source = articles[article_ind].source_name
                cur_count = 1
            else:
                cur_count += 1

        scores.append((topic_id, topic_score))

    scores.sort(key=lambda e: (e[1], -e[0]), reverse=True)
    return [score[0] for score in scores]


def gpt_request(
    topic_to_repr_articles: dict[int, list[Article]],
    ranked_topics: list[int],
    topic_model: BERTopic,
    num_clusters: int,
) -> list[GPTResponse]:
    """Get GPT responses for top `num_clusters` clusters.

    Args:
        topic_to_repr_articles (dict[int, list[Article]]): topic id -> list of
            most representative articles.
        ranked_topics (list[int]): list of topic ids, sorted from highest to
            lowest score by `score_clusters()`.
        topic_model (BERTopic): fitted BERTopic model.
        num_clusters (int): number of clusters to send to GPT.

    Returns:
        list[GPTResponse]: list of dicts returned by GPT, validated and
            converted to list of Pydantic models. Length should equal
            `num_clusters`.
    """
    client = OpenAI(
        api_key=get_env("AI_API_KEY"),
        base_url="https://api.deepseek.com",
    )

    headlines = [
        [article.title for article in topic_to_repr_articles[topic]]
        for topic in ranked_topics[:num_clusters]
    ]
    keywords = [
        # get_topic returns list of tuples (keyword, c-TF-IDF score)
        [e[0] for e in topic_model.get_topic(topic)]  # type: ignore
        for topic in ranked_topics[:num_clusters]
    ]

    prompt_headlines = json.dumps(headlines, separators=(",", ":"), ensure_ascii=False)
    prompt_keywords = json.dumps(keywords, separators=(",", ":"), ensure_ascii=False)

    with open("prompt.md") as fd:
        prompt_template = fd.read()
        user_prompt = " ".join(prompt_template.split()).format(
            headlines=prompt_headlines, keywords=prompt_keywords
        )

    print(user_prompt)

    completion = client.chat.completions.create(
        model="deepseek-v4-flash",
        extra_body={"thinking": {"type": "disabled"}},
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        response_format={"type": "json_object"},
        stream=False,
    )

    print(
        f"Tokens: prompt-cache-hit: {completion.usage.prompt_cache_hit_tokens}, prompt-cache-miss: {completion.usage.prompt_cache_miss_tokens}, output: {completion.usage.completion_tokens}"  # type: ignore
    )
    print(completion.choices[0].message.content)
    response: list[dict] = json.loads(completion.choices[0].message.content)  # type: ignore
    return [GPTResponse(**d) for d in response]


def prepare_transaction(
    gpt_responses: list[GPTResponse],
    topic_to_repr_articles: dict[int, list[Article]],
    ranked_topics: list[int],
    num_articles: int,
) -> list[dict]:
    """Format items for writing to DynamoDB.

    Args:
        gpt_responses (list[GPTResponse]): list of GPT responses.
        topic_to_repr_articles (dict[int, list[Article]]): topic id -> list of
            most representative articles.
        ranked_topics (list[int]): list of topic ids, sorted from highest to
            lowest score by `score_clusters()`.
        num_articles (int): max number of articles per cluster to write to db.

    Returns:
        list[dict]: list of transaction items to be written to db.
    """
    table_name = get_env("AWS_DB_TABLE_NAME")
    pk_timestamp, ttl_expire = generate_timestamps()

    # Exclude unrelated headlines as determined by GPT
    # topic id -> final list of articles
    topic_to_final_articles: dict[int, list[Article]] = {}
    for i, response in enumerate(gpt_responses):
        topic_articles = topic_to_repr_articles[ranked_topics[i]]
        # If less than 3 headlines remain, take first 3 headlines
        if len(topic_articles) - len(response.excluded_indices) < 3:
            topic_to_final_articles[ranked_topics[i]] = topic_articles[:3]
        else:
            topic_to_final_articles[ranked_topics[i]] = [
                a
                for i, a in enumerate(topic_articles)
                if i not in response.excluded_indices
            ][:num_articles]

    return [
        {
            "Put": {
                "TableName": table_name,
                "ConditionExpression": "attribute_not_exists(PK)",
                "Item": {
                    "PK": "Top#" + pk_timestamp,
                    "SK": str(i),
                    "expireAt": ttl_expire,
                    "category": response.category,
                    "topic": response.topic,
                    "summary": response.summary,
                    "articles": [
                        {
                            "link": article.link,
                            "pubDate": article.pub_date,
                            "source": article.source_name,
                            "title": article.title,
                        }
                        for article in topic_to_final_articles[ranked_topics[i]]
                    ],
                },
            }
        }
        for i, response in enumerate(gpt_responses)
    ]


def perform_transaction(transact_items: list[dict]):
    """Write items to DynamoDB."""
    dynamodb = boto3.resource("dynamodb", region_name=get_env("AWS_DB_REGION"))

    try:
        dynamodb.meta.client.transact_write_items(TransactItems=transact_items)  # type: ignore
    except Exception:
        logging.exception("DynamoDB exception")
    else:
        print("Successfully wrote items to db")


def lambda_handler(event, context):
    try:
        articles = collect_feeds()
        headlines = [a.title + " " + a.description for a in articles]
        topic_model = cluster(headlines)
        topic_to_repr_articles = get_representative_articles(articles, topic_model, 12)
        ranked_topics = score_clusters(articles, topic_model)
        gpt_responses = gpt_request(
            topic_to_repr_articles, ranked_topics, topic_model, 8
        )
        transact_items = prepare_transaction(
            gpt_responses, topic_to_repr_articles, ranked_topics, 6
        )
        perform_transaction(transact_items)
        return {"statusCode": 200, "body": [r.model_dump() for r in gpt_responses]}
    except Exception as e:
        return {"statusCode": 500, "body": repr(e)}
