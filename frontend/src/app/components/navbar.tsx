"use client";

import { useState, useEffect } from "react";
import Logo from "./logo";
import { IconArrowUpRight } from "@tabler/icons-react";

export default function Navbar() {
  const [curDate, setCurDate] = useState<string>();
  const [curTemp, setCurTemp] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeather = async (pos: GeolocationPosition) => {
      setLoading(true);
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m&temperature_unit=fahrenheit`,
      );
      const json = await response.json();
      setCurTemp(Math.round(json.current.temperature_2m));
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(fetchWeather, () =>
      setLoading(false),
    );

    let now = new Date();
    setCurDate(
      now.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <>
      <div className="relative flex select-none flex-row items-center justify-center py-6 sm:py-8">
        <div className="absolute left-0 flex flex-row items-center gap-6 font-manrope text-sm font-medium sm:flex">
          <div className="hidden flex-row items-center font-manrope text-[13px] font-medium text-gray-500 dark:text-gray-400 sm:flex">
            {loading ? (
              <div className="h-4 w-36 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700"></div>
            ) : (
              <>
                {curDate && <span>{curDate}</span>}{" "}
                {curTemp && <span>&nbsp;&nbsp;·&nbsp;&nbsp;{curTemp}°F</span>}
              </>
            )}
          </div>
        </div>
        <Logo />
        <a
          href="https://github.com/evxiong/elpunto"
          target="_blank"
          rel="noreferrer noopener"
          className="absolute right-0 -m-1 -ml-2 hidden items-center rounded-sm p-1 pl-2 font-manrope text-[13px] font-medium text-gray-500 underline decoration-gray-500 underline-offset-4 outline-none transition-all hover:cursor-pointer hover:decoration-gray-200 focus-visible:bg-gray-800/5 focus-visible:decoration-gray-200 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 dark:decoration-gray-400 dark:hover:decoration-gray-700 dark:focus-visible:bg-white/5 dark:focus-visible:decoration-gray-700 dark:focus-visible:outline-gray-500 sm:flex"
        >
          <span className="mr-0.5 cursor-pointer underline-offset-2 dark:text-gray-400">
            View on GitHub
          </span>
          <IconArrowUpRight className="size-4 stroke-gray-500 dark:stroke-gray-400" />
        </a>
      </div>

      {/* Mobile navbar */}
      <div className="mb-4 flex select-none flex-row justify-between gap-2 rounded-md border border-gray-200 p-4 font-manrope text-sm font-medium text-gray-700 dark:border-gray-700 sm:hidden">
        <div className="line-clamp-1 flex items-center font-manrope text-[13px] font-medium text-gray-500 dark:text-gray-400 sm:hidden">
          {loading ? (
            <div className="h-4 w-36 animate-pulse rounded-full bg-gray-100 dark:bg-gray-700"></div>
          ) : (
            <>
              {curDate && <span>{curDate}</span>}{" "}
              {curTemp && <span>&nbsp;&nbsp;·&nbsp;&nbsp;{curTemp}°F</span>}
            </>
          )}
        </div>
        <a
          href="https://github.com/evxiong/elpunto"
          target="_blank"
          rel="noreferrer noopener"
          className="-m-1 -ml-2 flex flex-shrink-0 items-center rounded-sm p-1 pl-2 font-manrope text-[13px] font-medium text-gray-500 underline decoration-gray-500 underline-offset-4 outline-none transition-all hover:cursor-pointer hover:decoration-gray-200 focus-visible:bg-gray-800/5 focus-visible:decoration-gray-200 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 dark:decoration-gray-400 dark:hover:decoration-gray-700 dark:focus-visible:bg-white/5 dark:focus-visible:decoration-gray-700 dark:focus-visible:outline-gray-500"
        >
          <span className="mr-0.5 cursor-pointer underline-offset-2 dark:text-gray-400">
            View on GitHub
          </span>
          <IconArrowUpRight className="size-4 stroke-gray-500 dark:stroke-gray-400" />
        </a>
      </div>
    </>
  );
}
