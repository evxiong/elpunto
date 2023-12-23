"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="relative flex flex-row select-none justify-center items-center py-8">
      {/* <div className="hidden sm:flex absolute left-0 font-manrope font-medium text-sm text-gray-500">
        {curDate}
      </div> */}
      <div className="flex flex-row items-center gap-6 sm:flex absolute left-0 font-manrope font-medium text-sm">
        {/* <Link href="/about">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="w-7 h-7 sm:w-5 sm:h-5 stroke-gray-500 hover:opacity-75"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
        </Link> */}

        {/* <button className="text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M3 9a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9Zm0 6.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </button> */}
        <div className="hidden sm:flex font-manrope font-medium text-[13px] text-gray-500">
          {curDate && <span>{curDate}</span>}
          {curTemp && <span>&nbsp;&nbsp;·&nbsp;&nbsp;{curTemp}°F</span>}
        </div>
      </div>
      <Link href="/" className="flex flex-row items-center gap-3">
        <div className="w-[10px] h-[10px] bg-green rounded-xl"></div>
        <div className="font-space font-medium text-lg tracking-tight">
          El Punto
        </div>
      </Link>
      {/* <div className="hidden sm:flex absolute right-0 font-manrope font-medium text-[13px] text-gray-500">
        {curDate && <span>{curDate}</span>}
        {curTemp && <span>&nbsp;&nbsp;·&nbsp;&nbsp;{curTemp}°F</span>}
      </div> */}
      <div className="flex absolute items-center right-0 font-manrope font-medium text-[13px] text-gray-500">
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7 sm:hidden fill-none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
        <button className="hidden sm:flex">Sign In</button>
      </div>
    </div>
  );
}
