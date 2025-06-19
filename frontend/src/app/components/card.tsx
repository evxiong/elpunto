import { IconNews, IconSparkles, IconX } from "@tabler/icons-react";
import { Headline } from "../lib/types";
import HeadlineCard from "./headlineCard";
import * as Popover from "@radix-ui/react-popover";

export default function Card({ headlines }: { headlines: Headline[] }) {
  return (
    <div className="mb-7 flex flex-col gap-4 rounded-md border border-gray-200 px-4 pb-8 pt-6 sm:px-6 dark:border-gray-700">
      <div className="flex flex-row items-center justify-between">
        <div className="text-vivo flex flex-row items-center gap-1.5">
          <IconNews aria-hidden="true" className="size-5 stroke-[1.5]" />
          <h1 className="dark:text-vivo font-space text-sm font-medium tracking-tight text-gray-500">
            Top Headlines
          </h1>
        </div>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              aria-label="View info on AI usage"
              className="-m-1 rounded-sm p-1 text-gray-500 outline-none transition-all hover:bg-gray-800/5 hover:text-gray-700 focus-visible:bg-gray-800/5 focus-visible:text-gray-700 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 data-[state=open]:bg-gray-800/5 data-[state=open]:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200 dark:focus-visible:bg-white/5 dark:focus-visible:text-gray-200 dark:focus-visible:outline-gray-500 dark:data-[state=open]:bg-white/5 dark:data-[state=open]:text-gray-200"
            >
              <IconSparkles
                aria-hidden="true"
                className="size-5 stroke-[1.5]"
              />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content align="end" sideOffset={6}>
              <div className="max-w-72 rounded-md border border-gray-700 bg-gray-900 p-3 drop-shadow-lg">
                <div className="flex flex-row items-center justify-between gap-6 font-space text-sm tracking-tight text-gray-200">
                  This website uses AI.
                  <Popover.Close
                    aria-label="Close"
                    className="-m-1 rounded-sm p-1 text-gray-400 outline-none transition-all hover:bg-white/5 hover:text-gray-200 focus-visible:bg-white/5 focus-visible:text-gray-200 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-500"
                  >
                    <IconX aria-hidden="true" className="size-3.5" />
                  </Popover.Close>
                </div>
                <hr className="my-1.5 border-gray-800" />
                <p className="font-manrope text-[13px]/snug text-gray-300">
                  DeepSeek-V3 and Sentence Transformers are used for clustering,
                  topic generation, and summary generation. Quality may vary,
                  and these models can make mistakes.
                </p>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      {headlines.map((headline, i) => (
        <HeadlineCard key={i} headline={headline} />
      ))}
    </div>
  );
}
