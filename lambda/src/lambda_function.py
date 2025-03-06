import boto3
import csv
import feedparser
import html2text
import json
import os
import pandas as pd
import re
from bertopic import BERTopic
from bertopic.representation import KeyBERTInspired
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from dateutil import parser, tz
from enum import StrEnum
from feedparser import FeedParserDict
from openai import OpenAI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering
from typing import Any

LAMBDA_EARLY = 13
LAMBDA_LATE = 21


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


def generate_times() -> tuple[str, int]:
    """Generate rounded timestamp and ttl for db.

    Timestamp is rounded down to either LAMBDA_EARLY or LAMBDA_LATE to be used
    in PK for database. TTL is generated 24 hours after timestamp for
    auto-deletion.

    Actual Lambda runs 15 min before LAMBDA_EARLY and LAMBDA_LATE to ensure
    smooth updates for users.

    Returns:
        tuple[str, int]: where str is ISO 8601 string of write time (either
            13:00 or 21:00 UTC) and int is epoch format of 1 day after, which is
            TTL expiration date in db.
    """
    now = datetime.now(timezone.utc)

    # if currently btwn < 30 min before LAMBDA_EARLY, and < 30 min before LAMBDA_LATE
    if (
        (now.hour == LAMBDA_EARLY - 1 and now.minute >= 30) or now.hour >= LAMBDA_EARLY
    ) and (
        (now.hour == LAMBDA_LATE - 1 and now.minute < 30) or now.hour < LAMBDA_LATE - 1
    ):
        now = now.replace(hour=LAMBDA_EARLY)
    else:
        if now.hour < LAMBDA_EARLY:
            now = now - timedelta(days=1)
        now = now.replace(hour=LAMBDA_LATE)

    now = now.replace(minute=0, second=0)
    return now.strftime("%Y-%m-%dT%H:%M:%SZ"), int(
        (now + timedelta(days=1)).timestamp()
    )


def collect_feeds(file_path: str = "top.csv") -> list[Article]:
    """Collect articles from RSS feeds in file_path.

    CSV file must have two columns: `name`, the source's name; and `link`, the
    link to the source's RSS feed.

    Args:
        file_path (str, optional): path to CSV file. Defaults to `top.csv`.

    Returns:
        list[Article]: flat list of all articles from all feeds.
    """
    with open(file_path, encoding="utf-8") as fd:
        reader = csv.DictReader(fd)
        sources = list(reader)

    rss_links = [source["feed"] for source in sources]

    print("Parsing RSS feeds...", end="")
    feeds: list[FeedParserDict] = [feedparser.parse(link) for link in rss_links]

    h = html2text.HTML2Text()
    h.ignore_links = True
    h.emphasis_mark = ""
    h.strong_mark = ""
    h.ignore_images = True
    h.ignore_emphasis = True

    eastern = tz.gettz("US/Eastern")
    tzinfos = {"EDT": eastern, "EST": eastern}
    exclude_descriptions = {"r/news", "Reuters"}
    current_time = datetime.now(timezone.utc)

    articles = []
    for i, source in enumerate(sources):
        source_links: set[str] = set()
        for entry in feeds[i]["entries"]:
            article_link: str = entry.link  # type: ignore
            if (
                article_link not in source_links
                and ("published" in entry or "updated" in entry)
                and (
                    "source" not in entry
                    or entry.source.href == "https://www.reuters.com"  # type: ignore
                )
            ):
                date_string: str = (  # type: ignore
                    entry.updatedate
                    if "updatedate" in entry
                    else entry.updated if "updated" in entry else entry.published
                )

                # Pre-processing: exclude any articles over 2 days old.
                if (
                    current_time
                    - parser.parse(date_string, tzinfos=tzinfos).astimezone(tz.UTC)
                ).days < 2:
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
                            title=" ".join(
                                re.sub(  # type: ignore
                                    r"-\s+Reuters(.|\n)*",
                                    "",
                                    h.handle(entry.get("title", "")),  # type: ignore
                                ).split()
                            ),
                            description=(
                                " ".join(h.handle(entry.get("summary", "")).split()[:75])  # type: ignore
                                if source["name"] not in exclude_descriptions
                                else ""
                            ),
                        )
                    )

                    source_links.add(article_link)

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
        grouped_topics[topic].append(article_ind)

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
        api_key=os.environ["DEEPSEEK_API_KEY"],
        base_url="https://api.deepseek.com",
    )

    prompt_titles = [
        [article.title for article in topic_to_repr_articles[topic]]
        for topic in ranked_topics[:num_clusters]
    ]
    prompt_keywords = [
        # get_topic returns list of tuples (keyword, c-TF-IDF score)
        [e[0] for e in topic_model.get_topic(topic)]  # type: ignore
        for topic in ranked_topics[:num_clusters]
    ]

    user_prompt = """You are a helpful news aggregator service. Here's a list of lists of news headlines: %s. Each sublist represents a cluster of news headlines. In addition, here's a list of lists of keywords which describe each cluster: %s. Your task is to analyze the headlines and keywords as follows. For each cluster, perform exactly the following steps, treating each cluster independently:
1. Based on the headlines, classify the cluster as belonging to exactly one of the following categories: U.S., World, Politics, Business, Tech, Sports, Entertainment, Science, Health.
2. Summarize the cluster's headlines in the style of a New York Times headline. The summary must be 8 words or less.
3. Based on the keywords and headlines, determine the news topic that each cluster is about. The topic must be 4 words or less (ex. "Russia-Ukraine War").
4. Some headlines within the cluster might not belong to this topic. For each headline, if you are more than 90%% confident that it does not belong this topic, store this headline's index in an array called "excluded_indices". Indices start from 0.
You must respond with an array of JSON objects (one object per cluster) in a single line without whitespaces, in exactly the following format: [{"category":<category>,"topic":<topic>,"summary":<summary>,"excluded_indices":<excluded_indices>},...]""" % (
        json.dumps(prompt_titles, separators=(",", ":"), ensure_ascii=False),
        json.dumps(prompt_keywords, separators=(",", ":"), ensure_ascii=False),
    )

    print(user_prompt)

    completion = client.chat.completions.create(
        model="deepseek-chat",
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        response_format={"type": "json_object"},
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
        list[dict]: List of transaction items to be written to db.
    """
    table_name = os.environ["TABLE_NAME"]
    pk_timestamp, ttl_expire = generate_times()

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
    dynamodb = boto3.resource(
        "dynamodb",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        region_name="us-west-1",
    )

    try:
        dynamodb.meta.client.transact_write_items(TransactItems=transact_items)  # type: ignore
    except Exception as exception:
        print("Exception raised: " + exception.__class__.__name__)
    else:
        print("Successfully wrote items to db")


def lambda_handler(event, context):
    articles = collect_feeds()
    headlines = [a.title + " " + a.description for a in articles]
    topic_model = cluster(headlines)
    topic_to_repr_articles = get_representative_articles(articles, topic_model, 12)
    ranked_topics = score_clusters(articles, topic_model)
    gpt_responses = gpt_request(topic_to_repr_articles, ranked_topics, topic_model, 8)
    transact_items = prepare_transaction(
        gpt_responses, topic_to_repr_articles, ranked_topics, 6
    )
    perform_transaction(transact_items)
    return {"statusCode": 200, "body": gpt_responses}
