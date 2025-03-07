import { IconNews } from "@tabler/icons-react";
import { Headline } from "../lib/types";
import HeadlineCard from "./headlineCard";

export default function Card({ headlines }: { headlines: Headline[] }) {
  return (
    <div className="mb-7 flex flex-col gap-4 rounded-md border border-gray-200 px-4 pb-8 pt-6 dark:border-gray-700 sm:px-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-1.5 text-green">
          <IconNews className="size-5 stroke-[1.5]" />
          <h1 className="font-space text-sm font-medium tracking-tight text-green">
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
