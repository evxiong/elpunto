"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [curDate, setCurDate] = useState<string>();
  const [curTemp, setCurTemp] = useState<number>();

  useEffect(() => {
    const fetchWeather = async (pos: GeolocationPosition) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&hourly=temperature_2m&temperature_unit=fahrenheit&forecast_days=1`
      );
      const json = await response.json();
      console.log(json);
      setCurTemp(Math.round(json.hourly.temperature_2m[0]));
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
      <div className="hidden sm:flex absolute left-0 font-inter text-sm text-gray-500">
        {curDate}
      </div>
      <div className="flex flex-row items-center gap-3">
        <div className="w-[10px] h-[10px] bg-green rounded-xl"></div>
        <div className="font-space font-medium text-lg tracking-tight">
          El Punto
        </div>
      </div>
      {curTemp && (
        <div className="hidden sm:flex absolute right-0 font-inter text-sm text-gray-500">
          {curTemp}°F
        </div>
      )}
    </div>
  );
}
