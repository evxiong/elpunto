"use client";

import { useState, useEffect } from "react";
import Logo from "./logo";
import { IconArrowUpRight, IconTemperatureSun } from "@tabler/icons-react";

export default function Navbar() {
  const [curTemp, setCurTemp] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("denied");

  const curDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const fetchWeather = async (pos: GeolocationPosition) => {
    setLoading(true);
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m&temperature_unit=fahrenheit`,
    );
    const json = await response.json();
    setCurTemp(Math.round(json.current.temperature_2m));
    setLoading(false);
  };

  const requestWeather = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(fetchWeather, () => {
      setPermissionState("denied");
      setLoading(false);
    });
  };

  useEffect(() => {
    const queryPermission = async () => {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setPermissionState(result.state);
      if (result.state === "granted") {
        requestWeather();
      }
    };
    queryPermission();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="relative flex flex-row items-center justify-center py-6 sm:py-8">
        <div className="absolute left-0 flex flex-row items-center font-manrope">
          <div className="hidden sm:flex">
            <DateTemp
              loading={loading}
              curDate={curDate}
              curTemp={curTemp}
              promptable={permissionState === "prompt"}
              requestWeather={requestWeather}
            />
          </div>
        </div>
        <Logo />
        <a
          href="https://github.com/evxiong/elpunto"
          target="_blank"
          rel="noreferrer noopener"
          className="absolute right-0 -m-1 -ml-2 hidden items-center rounded-sm p-1 pl-2 font-manrope text-[13px] font-medium text-gray-500 underline decoration-gray-500 underline-offset-4 outline-none transition-all hover:cursor-pointer hover:decoration-gray-200 focus-visible:bg-gray-800/5 focus-visible:decoration-gray-200 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 sm:flex dark:text-gray-400 dark:decoration-gray-400 dark:hover:decoration-gray-700 dark:focus-visible:bg-white/5 dark:focus-visible:decoration-gray-700 dark:focus-visible:outline-gray-500"
        >
          <span className="mr-0.5 cursor-pointer underline-offset-2">
            View on GitHub
          </span>
          <IconArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>

      {/* Mobile navbar */}
      <div className="mb-4 flex flex-row justify-between gap-2 rounded-md border border-gray-200 p-4 font-manrope text-sm font-medium text-gray-700 sm:hidden dark:border-gray-700">
        <div className="flex sm:hidden">
          <DateTemp
            loading={loading}
            curDate={curDate}
            curTemp={curTemp}
            promptable={permissionState === "prompt"}
            requestWeather={requestWeather}
          />
        </div>
        <a
          href="https://github.com/evxiong/elpunto"
          target="_blank"
          rel="noreferrer noopener"
          className="-m-1 -ml-2 flex flex-shrink-0 items-center rounded-sm p-1 pl-2 font-manrope text-[13px] font-medium text-gray-500 underline decoration-gray-500 underline-offset-4 outline-none transition-all hover:cursor-pointer hover:decoration-gray-200 focus-visible:bg-gray-800/5 focus-visible:decoration-gray-200 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 dark:text-gray-400 dark:decoration-gray-400 dark:hover:decoration-gray-700 dark:focus-visible:bg-white/5 dark:focus-visible:decoration-gray-700 dark:focus-visible:outline-gray-500"
        >
          <span className="mr-0.5 cursor-pointer underline-offset-2">
            View on GitHub
          </span>
          <IconArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </>
  );
}

function DateTemp({
  loading,
  curDate,
  curTemp,
  promptable,
  requestWeather,
}: {
  loading: boolean;
  curDate: string;
  curTemp?: number;
  promptable: boolean; // whether location can be prompted
  requestWeather: () => void;
}) {
  return (
    <p className="font-manrope text-[13px] font-medium text-gray-500 dark:text-gray-400">
      <span>{curDate}</span>
      {(promptable || loading || curTemp !== undefined) && (
        <span>&nbsp;&nbsp;·&nbsp;&nbsp;</span>
      )}
      {promptable && !loading && curTemp === undefined && (
        <button
          role="button"
          aria-label="Fetch current temperature"
          className="-m-1.5 inline-block rounded-sm p-1.5 align-[-0.25em] outline-none transition-all hover:bg-gray-800/5 hover:text-gray-700 focus-visible:bg-gray-800/5 focus-visible:text-gray-700 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200 dark:focus-visible:bg-white/5 dark:focus-visible:text-gray-200 dark:focus-visible:outline-gray-500"
          onClick={requestWeather}
        >
          <IconTemperatureSun aria-hidden="true" className="size-4" />
        </button>
      )}
      {loading ? (
        <span className="inline-block h-4 w-8 animate-pulse rounded-full bg-gray-100 align-[-0.25em] dark:bg-gray-700"></span>
      ) : (
        <>{curTemp && <span>{curTemp}°F</span>}</>
      )}
    </p>
  );
}
