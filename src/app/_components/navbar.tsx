"use client";

import { useState, useEffect } from "react";
import Logo from "./logo";

export default function Navbar() {
  const [curDate, setCurDate] = useState<string>();
  const [curTemp, setCurTemp] = useState<number>();

  useEffect(() => {
    const fetchWeather = async (pos: GeolocationPosition) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m&temperature_unit=fahrenheit`
      );
      const json = await response.json();
      console.log(json);
      setCurTemp(Math.round(json.current.temperature_2m));
    };

    navigator.geolocation.getCurrentPosition(fetchWeather);

    let now = new Date();
    setCurDate(
      now.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  return (
    <>
      <div className="relative flex flex-row select-none justify-center items-center py-6 sm:py-8">
        <div className="flex flex-row items-center gap-6 sm:flex absolute left-0 font-manrope font-medium text-sm">
          <div className="hidden sm:flex font-manrope font-medium text-[13px] text-neutral-500 dark:text-gray-400">
            {curDate && <span>{curDate}</span>}
            {curTemp && <span>&nbsp;&nbsp;·&nbsp;&nbsp;{curTemp}°F</span>}
          </div>
        </div>
        <Logo />
        <a
          href="https://github.com/evxiong/elpunto"
          target="_blank"
          rel="noreferrer noopener"
          className="hidden sm:flex hover:cursor-pointer hover:decoration-neutral-200 dark:hover:decoration-gray-700 decoration-neutral-500 dark:decoration-gray-400 underline underline-offset-4 absolute items-center right-0 font-manrope font-medium text-[13px] text-neutral-500"
        >
          <span className="underline-offset-2 cursor-pointer mr-0.5 dark:text-gray-400">
            View on GitHub
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="w-4 h-4 fill-neutral-500 dark:fill-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>

      {/* Mobile navbar */}
      <div className="select-none sm:hidden border font-manrope text-sm font-medium text-neutral-700 border-gray-200 dark:border-gray-700 rounded-md mb-4 p-4 flex flex-row gap-2 justify-between">
        <div className="sm:hidden font-manrope font-medium text-[13px] text-neutral-500 dark:text-gray-400 line-clamp-1">
          {curDate && (
            <span>
              {curDate}
              {curTemp && <>&nbsp;&nbsp;·&nbsp;&nbsp;{curTemp}°F</>}
            </span>
          )}
        </div>
        <a
          href="https://github.com/evxiong/elpunto"
          target="_blank"
          rel="noreferrer noopener"
          className="flex-shrink-0 hover:cursor-pointer hover:decoration-neutral-200 dark:hover:decoration-gray-700 decoration-neutral-500 dark:decoration-gray-400 underline underline-offset-4 flex items-center font-manrope font-medium text-[13px] text-neutral-500"
        >
          <span className="underline-offset-2 cursor-pointer mr-0.5 dark:text-gray-400">
            View on GitHub
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="w-4 h-4 fill-neutral-500 dark:fill-gray-400"
          >
            <path
              fillRule="evenodd"
              d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </>
  );
}
