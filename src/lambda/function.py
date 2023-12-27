import feedparser
from pandas import read_csv
import html2text
from tqdm import tqdm
import re
import datetime
import json
from dateutil import parser
from dateutil import tz

def main():
    pass

# def collectRSSFeeds():
#     # Get headlines from RSS feeds in feeds.csv
#     df = read_csv("top.csv")
#     sources = list(df.itertuples(index=False, name=None))

#     print("Parsing RSS feeds...")
#     feeds = [feedparser.parse(source[1]) for source in tqdm(sources)]
#     print()

#     eastern = tz.gettz("US/Eastern")
#     tzinfos = {"EDT": eastern, "EST": eastern}

#     h = html2text.HTML2Text()
#     h.ignore_links = True
#     h.emphasis_mark = ""
#     h.strong_mark = ""
#     h.ignore_anchors = True
#     h.ignore_images = True
#     h.ignore_emphasis = True

#     # titles = [
#     #     " ".join(
#     #         re.sub(
#     #             "-\s+Reuters(.|\n)+",
#     #             "",
#     #             re.sub(
#     #                 "submitted\s+by(.|\n)+",
#     #                 "",
#     #                 h.handle(entry.get("summary", "")),
#     #             ),
#     #         )
#     #         .replace("\n", " ")
#     #         .replace("*", "")
#     #         .split()
#     #     )
#     #     for feed in feeds
#     #     for entry in feed["entries"]
#     # ]

#     d = {}  # article link -> [timestamp, source, pub_date, title, section, description]
#     # for i, (source, section, _) in enumerate(sources):
#     for i, (source, _) in enumerate(sources):
#         for entry in feeds[i]["entries"]:
#             if entry["link"] not in d and ("published" in entry or "updated" in entry):
#                 if (
#                     "source" not in entry
#                     or entry.source.href == "https://www.reuters.com"
#                 ):
#                     date = (
#                         entry["published"] if "published" in entry else entry["updated"]
#                     )
#                     d[entry["link"]] = {
#                         "link": entry["link"],
#                         "timestamp": str(datetime.datetime.now(datetime.timezone.utc)),
#                         "source": source,
#                         "pub_date": str(parser.parse(date, tzinfos=tzinfos)),
#                         "title": ' '.join(re.sub(
#                             r"-\s+Reuters(.|\n)+",
#                             "",
#                             h.handle(entry.get("title", "")),
#                         ).split()),
#                         # "section": 0,
#                         "description": ' '.join(re.sub(
#                             r"submitted\s+by(.|\n)+",
#                             "",
#                             h.handle(entry.get("summary", "")),
#                         ).split()[:100]),
#                     }
#             # d[entry["link"]]["section"] |= SECTION_ENCODINGS[section]

#     with open("headlines.csv", "w", encoding="utf-8") as fd:
#         fd.write("date,title,description\n")

#     with open("headlines.csv", "a", encoding="utf-8") as fd:
#         for headline in d.values():
#             fd.write(
#                 f"{headline['pub_date']},{headline['title']},{headline['description']}\n"
#             )

#     print(f"Read {len(d)} headlines")


# collectRSSFeeds()
