"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { CATEGORIES, ICONS } from "../lib/constants";
import { ArticleInfo, Headline } from "../lib/types";
import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

export default function HeadlineCard({ headline }: { headline: Headline }) {
  const [expanded, setExpanded] = useState(false);
  const numArticles = expanded ? headline.articles.length : 3;
  return (
    <div className="w-full rounded-md border border-gray-200 pt-4 dark:border-gray-700">
      <h2 className="mb-2 line-clamp-1 px-4 font-space text-xs font-normal leading-5 text-gray-700 dark:text-gray-400">
        <span
          className={`${
            CATEGORIES[headline.category]
          } rounded-full bg-opacity-10 px-1.5 py-0.5 font-medium`}
        >
          {headline.category}
        </span>{" "}
        · {headline.topic.charAt(0).toUpperCase() + headline.topic.slice(1)}
      </h2>
      <div className="px-4 md:grid md:grid-cols-2 md:gap-12">
        <div className="mb-2 flex flex-col gap-2 md:mb-0">
          <h1 className="font-manrope text-2xl font-medium leading-7 tracking-[-0.0125em] text-gray-700 dark:text-gray-200 md:leading-8">
            {headline.summary}
          </h1>
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
        src={ICONS[info.source]}
        alt={info.source + " icon"}
        className="pointer-events-none mt-[2px] h-5 w-5 flex-shrink-0 self-start rounded-sm border border-gray-200 dark:border-gray-700"
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
