import { CATEGORIES, ICONS } from "./constants";

export interface Headline {
  category: keyof typeof CATEGORIES;
  topic: string;
  summary: string;
  articles: ArticleInfo[];
}

export interface ArticleInfo {
  title: string;
  pubDate: string;
  source: keyof typeof ICONS;
  link: string;
}
