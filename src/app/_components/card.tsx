import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";

const CATEGORIES = {
  "U.S.": "text-us bg-us",
  World: "text-world bg-world",
  Politics: "text-politics bg-politics",
  Business: "text-business bg-business",
  Tech: "text-tech bg-tech",
  Sports: "text-sports bg-sports",
  Entertainment: "text-entertainment bg-entertainment",
  Science: "text-science bg-science",
  Health: "text-health bg-health",
} as const;

const ICONS = {
  "ABC News": "https://s.abcnews.com/assets/dtci/images/favicon.ico",
  Axios: "https://www.axios.com/images/apple-touch-icon.png",
  "BBC News": "https://www.bbc.com/bbcx/favicon-32x32.png",
  "CBS News":
    "https://www.cbsnews.com/fly/bundles/cbsnewscore/icons/icon-192x192.png",
  CNN: "https://www.cnn.com/media/sites/cnn/favicon.ico",
  "The Guardian":
    "https://assets.guim.co.uk/static/frontend/icons/homescreen/apple-touch-icon-120.png",
  "The Hill":
    "https://thehill.com/wp-content/uploads/sites/2/2023/03/cropped-favicon-512px-1.png?w=32",
  "NBC News":
    "https://nodeassets.nbcnews.com/cdnassets/projects/ramen/favicon/nbcnews/all-other-sizes-PNG.ico/favicon-32x32.png",
  "The New York Times":
    "https://www.nytimes.com/vi-assets/static-assets/apple-touch-icon-28865b72953380a40aa43318108876cb.png",
  NPR: "https://media.npr.org/chrome/favicon/favicon-32x32.png",
  "PBS Newshour":
    "https://d3i6fh83elv35t.cloudfront.net/static/assets/images/favicon/favicon-32x32.png",
  Politico: "https://static.politico.com/cf/05/ee684a274496b04fa20ba2978da1/politico.png",
  "r/news":
    "https://styles.redditmedia.com/t5_2qh3l/styles/communityIcon_fmygcobc22z81.png",
  Reuters:
    "https://www.reuters.com/pf/resources/images/reuters/favicon/tr_fvcn_kinesis_32x32.ico?d=168",
  Time: "https://time.com/img/favicons/favicon-32.png",
  Vox: "https://cdn.vox-cdn.com/community_logos/52517/voxv.png",
  "The Washington Post": "https://www.washingtonpost.com/favicon.ico",
  "The Athletic":
    "https://theathletic.com/static/img/cropped-cropped-favicon1-180x180.png",
  ESPN: "https://a.espncdn.com/wireless/mw5/r1/images/bookmark-icons-v2/espn-icon-72x72.png",
  CNBC: "https://sc.cnbcfm.com/applications/cnbc.com/staticcontent/img/favicon.ico",
  "Financial Times":
    "https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1%3Abrand-ft-logo-square-coloured?source=update-logos&format=png&width=64&height=64",
  "Al Jazeera": "https://www.aljazeera.com/favicon_aje.ico",
  "Deutsche Welle": "https://www.dw.com/images/icons/favicon-32x32.png",
} as const;

export interface Headline {
  category: keyof typeof CATEGORIES;
  topic: string;
  summary: string;
  articles: ArticleInfo[];
}

interface ArticleInfo {
  title: string;
  pubDate: string;
  source: keyof typeof ICONS;
  link: string;
}

export default function Card({ headlines }: { headlines: Headline[] }) {
  return (
    <div className="flex flex-col gap-4 px-4 sm:px-6 pt-6 pb-8 border border-gray-200 dark:border-gray-700 rounded-md mb-7">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center text-green">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
            />
          </svg>
          <h1 className="font-space text-green font-medium text-sm tracking-tight">
            Top Headlines
          </h1>
        </div>
      </div>
      {headlines.map((headline, i) => (
        <HeadlineCard key={i} headline={headline} />
      ))}
    </div>
  );
}

function HeadlineCard({ headline }: { headline: Headline }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 w-full rounded-md p-4 pb-6">
      <h2 className="font-space text-xs font-normal line-clamp-1 leading-5 text-gray-700 dark:text-gray-400 mb-2">
        <span
          className={`${
            CATEGORIES[headline.category]
          } font-medium bg-opacity-10 py-0.5 px-1.5 rounded-full`}
        >
          {headline.category}
        </span>{" "}
        · {headline.topic.charAt(0).toUpperCase() + headline.topic.slice(1)}
      </h2>
      <div className="md:grid md:grid-cols-2 md:gap-12">
        <div className="mb-2 md:mb-0 flex flex-col gap-2">
          <h1 className="text-2xl font-medium tracking-[-0.0125em] font-manrope leading-7 md:leading-8 text-neutral-700 dark:text-gray-200">
            {headline.summary}
          </h1>
        </div>
        <div className="flex flex-col text-neutral-700">
          {headline.articles.map((article, i) => (
            <Article key={i} info={article} />
          ))}
        </div>
      </div>
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
      className="hover:bg-neutral-100 active:bg-neutral-100 dark:hover:bg-white dark:hover:bg-opacity-5 dark:active:bg-white dark:active:bg-opacity-5 p-2 rounded-md cursor-pointer flex flex-row font-manrope text-sm font-medium tracking-normal items-center gap-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={ICONS[info.source]}
        alt={info.source + " icon"}
        className="pointer-events-none w-5 h-5 rounded-sm border border-gray-200 dark:border-gray-700 self-start mt-[2px]"
      />
      <div className="flex tracking-normal flex-col leading-4 gap-0.5 dark:text-gray-300">
        {info.title}
        <span className="text-xs font-space font-normal text-neutral-500 dark:text-gray-400">
          {dayjs().to(time)} · {info.source}
        </span>
      </div>
    </a>
  );
}
