"use client";

import FEEDS from "@/app/feeds.json";
import { IconChevronDown } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { useState } from "react";
import type { ArticleInfo, Category, Headline } from "../lib/types";

export const CATEGORY_STYLES: Record<Category, string> = {
  "U.S.": "text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-700/30",
  World: "text-cyan-700 bg-cyan-100 dark:text-cyan-500 dark:bg-cyan-700/30",
  Politics:
    "text-violet-700 bg-violet-100 dark:text-violet-400 dark:bg-violet-700/30",
  Business:
    "text-green-700 bg-green-100 dark:text-green-500 dark:bg-green-700/30",
  Tech: "text-lime-700 bg-lime-100 dark:text-lime-500 dark:bg-lime-700/30",
  Sports: "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-700/30",
  Entertainment:
    "text-amber-700 bg-amber-100 dark:text-amber-500 dark:bg-amber-700/30",
  Science:
    "text-slate-700 bg-slate-100 dark:text-slate-400 dark:bg-slate-600/30",
  Health:
    "text-fuchsia-700 bg-fuchsia-100 dark:text-fuchsia-400 dark:bg-fuchsia-700/30",
};

export default function HeadlineCard({ headline }: { headline: Headline }) {
  const [expanded, setExpanded] = useState(false);
  const numArticles = expanded ? headline.articles.length : 3;
  return (
    <div className="w-full rounded-md border border-gray-200 pt-4 dark:border-gray-700">
      <p className="mb-2 line-clamp-1 px-4 font-space text-xs/5 font-normal text-gray-700 dark:text-gray-400">
        <span
          className={`${
            CATEGORY_STYLES[headline.category]
          } rounded-full px-1.5 py-0.5 font-medium`}
        >
          {headline.category}
        </span>{" "}
        · {headline.topic.charAt(0).toUpperCase() + headline.topic.slice(1)}
      </p>
      <div className="px-4 md:grid md:grid-cols-2 md:gap-12">
        <div className="mb-2 flex flex-col gap-2 md:mb-0">
          <h2 className="font-manrope text-2xl font-medium leading-7 tracking-[-0.0125em] text-gray-700 md:leading-8 dark:text-gray-200">
            {headline.summary}
          </h2>
        </div>
        <div className="flex flex-col text-gray-700">
          {headline.articles.slice(0, numArticles).map((article, i) => (
            <Article key={i} info={article} />
          ))}
        </div>
      </div>
      {headline.articles.length > 3 ? (
        <button
          role="button"
          aria-label="More articles"
          aria-pressed={expanded}
          onClick={() => setExpanded(!expanded)}
          className="group mt-2 flex h-8 w-full items-center justify-center rounded-b-md px-4 outline-none transition-all hover:bg-gray-800/5 focus-visible:bg-gray-800/5 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 dark:hover:bg-white/5 dark:focus-visible:bg-white/5 dark:focus-visible:outline-gray-500"
        >
          <IconChevronDown
            aria-hidden="true"
            className={`${expanded ? "rotate-180" : ""} size-5 stroke-gray-300 transition-all group-hover:stroke-gray-700 group-focus-visible:stroke-gray-700 dark:stroke-gray-600 dark:group-hover:stroke-gray-300 dark:group-focus-visible:stroke-gray-300`}
          />
        </button>
      ) : (
        <div className="mt-6"></div>
      )}
    </div>
  );
}

function Article({ info }: { info: ArticleInfo }) {
  dayjs.extend(relativeTime);
  dayjs.extend(updateLocal);
  dayjs.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s",
      s: "%ds",
      m: "1m",
      mm: "%dm",
      h: "1h",
      hh: "%dh",
      d: "1d",
      dd: "%dd",
      M: "1mo",
      MM: "%dmo",
      y: "1y",
      yy: "%dy",
    },
  });
  const time = dayjs(info.pubDate);

  return (
    <a
      href={info.link}
      className="flex cursor-pointer flex-row items-center gap-2 rounded-md p-2 font-manrope text-sm font-medium tracking-normal outline-none transition-all hover:bg-gray-800/5 focus-visible:bg-gray-800/5 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 dark:hover:bg-white/5 dark:focus-visible:bg-white/5 dark:focus-visible:outline-gray-500"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        aria-hidden="true"
        src={FEEDS[info.source]}
        alt={info.source + " icon"}
        className="pointer-events-none mt-[2px] size-5 shrink-0 self-start rounded-sm border border-gray-200 dark:border-gray-700"
      />
      <div className="flex flex-col gap-0.5 leading-4 tracking-normal dark:text-gray-300">
        {info.title}
        <span className="font-space text-xs font-normal text-gray-500 dark:text-gray-400">
          {dayjs().to(time)} · {info.source}
        </span>
      </div>
    </a>
  );
}
