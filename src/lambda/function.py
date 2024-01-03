from tqdm import tqdm
from datetime import datetime, timezone, timedelta
from dateutil import parser, tz
from dotenv import load_dotenv
from bertopic import BERTopic
from bertopic.representation import KeyBERTInspired
from sklearn.cluster import AgglomerativeClustering
from openai import OpenAI
import feedparser
import pandas as pd
import html2text
import re
import boto3
import os
import ast
import json

LAMBDA_EARLY = 13
LAMBDA_LATE = 21

load_dotenv("../../.env.local")


def generate_times():
    """Generates rounded timestamp and ttl for db.

    Timestamp is rounded down to either LAMBDA_EARLY or LAMBDA_LATE
    to be used in PK for database. TTL is generated 24 hours after
    timestamp for auto-deletion.

    Returns:
        Tuple (a, b) where a is ISO 8601 string of write time
        (either 13:00 or 21:00 UTC) and b is epoch format of 1 day
        after, which is TTL expiration date in db.
    """
    now = datetime.now(timezone.utc)
    # now = datetime.strptime('12-24-2023 13:01', '%m-%d-%Y %H:%M')

    if now.hour >= LAMBDA_EARLY and now.hour < LAMBDA_LATE:
        now = now.replace(hour=LAMBDA_EARLY)
    else:
        if now.hour < LAMBDA_EARLY:
            now = now - timedelta(days=1)
        now = now.replace(hour=LAMBDA_LATE)

    now = now.replace(minute=0, second=0)
    return now.strftime("%Y-%m-%dT%H:%M:%SZ"), int(
        (now + timedelta(days=1)).timestamp()
    )


def collect_feeds():
    """Collects articles from RSS feeds in top.csv.

    Returns:
        Tuple (a, b) where a is a list of dicts; each dict contains
        one article's info. b is a list of combined titles and
        descriptions only.
    """
    df = pd.read_csv("top.csv")

    rss_links = df["Feed"].tolist()
    sources = list(df.itertuples(index=False, name=None))

    print("Parsing RSS feeds...")
    feeds = [feedparser.parse(link) for link in tqdm(rss_links)]

    h = html2text.HTML2Text()
    h.ignore_links = True
    h.emphasis_mark = ""
    h.strong_mark = ""
    h.ignore_anchors = True
    h.ignore_images = True
    h.ignore_emphasis = True

    eastern = tz.gettz("US/Eastern")
    tzinfos = {"EDT": eastern, "EST": eastern}

    data = []
    headlines = []
    for i, (source, _) in enumerate(sources):
        links = set()
        for entry in feeds[i]["entries"]:
            if entry["link"] not in links:
                if "published" in entry or "updated" in entry:
                    if (
                        "source" not in entry
                        or entry.source.href == "https://www.reuters.com"
                    ):
                        date = (
                            entry["updatedate"]
                            if "updatedate" in entry
                            else entry["updated"]
                            if "updated" in entry
                            else entry["published"]
                        )

                        # Pre-processing: exclude any articles over 2 days old.
                        if (
                            datetime.now(timezone.utc)
                            - parser.parse(date, tzinfos=tzinfos).astimezone(tz.UTC)
                        ).days < 2:
                            data.append(
                                {
                                    "link": entry["link"],
                                    "timestamp": str(datetime.now(timezone.utc)),
                                    "source": source,
                                    "pub_date": str(
                                        parser.parse(date, tzinfos=tzinfos).astimezone(
                                            tz.UTC
                                        )
                                    ),
                                    "title": " ".join(
                                        re.sub(
                                            r"-\s+Reuters(.|\n)+",
                                            "",
                                            h.handle(entry.get("title", "")),
                                        ).split()
                                    ),
                                    "description": " ".join(
                                        re.sub(
                                            r"submitted\s+by(.|\n)+",
                                            "",
                                            h.handle(entry.get("summary", "")),
                                        ).split()[:75]
                                    ),
                                }
                            )
                            headlines.append(
                                data[-1]["title"] + " " + data[-1]["description"]
                            )
                            links.add(entry["link"])

    return data, headlines


def cluster(headlines):
    """Cluster articles using BERTopic.

    Returns:
        BERTopic model after topic generation.
    """
    cluster_model = AgglomerativeClustering(n_clusters=None, distance_threshold=1.5)
    topic_model = BERTopic(
        embedding_model="all-MiniLM-L6-v2",
        hdbscan_model=cluster_model,
        representation_model=KeyBERTInspired(),
    )
    topic_model.fit_transform(headlines)
    return topic_model


def get_representative_articles(data, topic_model):
    """Get 8 most representative articles of each cluster.

    Returns:
        Dict that maps topic index to list of dicts
        containing article info of 8 most representative
        articles.
    """
    documents = pd.DataFrame(
        {
            "Document": [d["title"] for d in data],
            "ID": range(len(data)),
            "Topic": topic_model.topics_,
        }
    )

    (
        repr_docs_map,
        _,
        _,
        repr_docs_ids,
    ) = topic_model._extract_representative_docs(
        c_tf_idf=topic_model.c_tf_idf_,
        documents=documents,
        topics=topic_model.topic_representations_,
        nr_repr_docs=8,
    )

    for key in repr_docs_map.keys():
        repr_docs = [data[id] for id in repr_docs_ids[key]]
        repr_docs.sort(key=lambda e: e["pub_date"], reverse=True)
        repr_docs_map[key] = repr_docs

    return repr_docs_map


def score_clusters(data, topic_model):
    """Score clusters based on diversity of sources.

    Top headlines are determined by sorting clusters by their
    scores. Each article in a cluster contributes 1 point,
    up to 4 points from the same source. This is to adjust
    for spam from one source (especially for sports news).

    Returns:
        List of topic indices, sorted from highest to lowest
        score.
    """
    grouped_topics = {topic: [] for topic in set(topic_model.topics_)}
    for index, topic in enumerate(topic_model.topics_):
        grouped_topics[topic].append(index)

    scores = []
    cur_ind = 0
    while cur_ind < len(grouped_topics):
        tot_count = 0
        cur_source = None
        cur_count = 0
        for docId in grouped_topics[cur_ind]:
            if cur_count < 4:
                tot_count += 1

            if cur_source != data[docId]["source"]:
                cur_source = data[docId]["source"]
                cur_count = 1
            else:
                cur_count += 1

        scores.append((cur_ind, tot_count))
        cur_ind += 1

    scores.sort(key=lambda e: (e[1], -e[0]), reverse=True)
    return [score[0] for score in scores]


def gpt_request(repr_docs_map, ranked_topics, topic_model):
    """Gets category, topic, summary for top 8 headlines.

    Returns:
        List of dicts containing category, topic, and summary
        of each top headline.
    """
    client = OpenAI()

    prompt_titles = json.dumps(
        [
            [article["title"] for article in repr_docs_map[topic]]
            for topic in ranked_topics[:8]
        ],
        separators=(",", ":"),
    )
    prompt_keywords = json.dumps(
        [[e[0] for e in topic_model.get_topic(topic)] for topic in ranked_topics[:8]],
        separators=(",", ":"),
    )

    prompt = """You are a news aggregator service. Here's a list of news headline clusters. Each sublist contains a small but representative subset of all headlines in the same cluster: %s. For each sublist, perform exactly the following steps (treat each cluster independently):
1. Based on the headlines, classify the cluster as belonging to one of the following categories: U.S., World, Politics, Business, Tech, Sports, Entertainment, Science, Health. If it belongs to multiple categories, choose the more specific one.
2. Use the headlines to generate a summary news headline for the cluster in the style of The New York Times (max 10 words).
The clusters are described by the following keywords: %s. Based on the keywords and headlines, determine the news story that each cluster is about (ex. "Russia-Ukraine War").
Answer with an array of JSON objects in a single line without whitespaces: [{"category":<category>,"topic":<topic>,"summary":<summary>},...]""" % (
        prompt_titles,
        prompt_keywords,
    )

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo-1106",
        max_tokens=2000,
        temperature=0.5,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    print(completion.choices[0].message.content)
    print("Tokens used: " + str(completion.usage.total_tokens))
    return ast.literal_eval(completion.choices[0].message.content)


def prepare_transaction(gpt_responses, repr_docs_map, ranked_topics):
    """Format items for writing to db.

    Returns:
        List of dicts with Put items to be written
        to db.
    """
    table_name = os.environ["TABLE_NAME"]
    pk_timestamp, ttl_expire = generate_times()

    return [
        {
            "Put": {
                "TableName": table_name,
                "ConditionExpression": "attribute_not_exists(PK)",
                "Item": {
                    "PK": "Top#" + pk_timestamp,
                    "SK": str(i),
                    "expireAt": ttl_expire,
                    **response,
                    "articles": [
                        {
                            "link": article["link"],
                            "pubDate": article["pub_date"],
                            "source": article["source"],
                            "title": article["title"],
                        }
                        for article in repr_docs_map[ranked_topics[i]][:3]
                    ],
                },
            }
        }
        for i, response in enumerate(gpt_responses)
    ]


def perform_transaction(transact_items):
    """Write items to db."""
    dynamodb = boto3.resource("dynamodb")

    try:
        dynamodb.meta.client.transact_write_items(TransactItems=transact_items)
    except Exception as exception:
        print("Exception raised: " + exception.__class__.__name__)
    else:
        print("Successfully wrote items to db")


def main():
    data, headlines = collect_feeds()
    topic_model = cluster(headlines)
    repr_articles_map = get_representative_articles(data, topic_model)
    ranked_topics = score_clusters(data, topic_model)
    gpt_responses = gpt_request(repr_articles_map, ranked_topics, topic_model)
    transact_items = prepare_transaction(
        gpt_responses, repr_articles_map, ranked_topics
    )
    perform_transaction(transact_items)


if __name__ == "__main__":
    main()
