import FEEDS from "@/app/feeds.json";

export type Category =
  | "U.S."
  | "World"
  | "Politics"
  | "Business"
  | "Tech"
  | "Sports"
  | "Entertainment"
  | "Science"
  | "Health";

export interface Headline {
  category: Category;
  topic: string;
  summary: string;
  articles: ArticleInfo[];
}

export interface ArticleInfo {
  title: string;
  pubDate: string;
  source: keyof typeof FEEDS;
  link: string;
}
