"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Logo() {
  const { theme, setTheme } = useTheme();

  // https://github.com/pacocoursey/next-themes/issues/220
  const [newTheme, setNewTheme] = useState<string>();

  useEffect(() => {
    const checkDarkTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const newThemeValue =
      theme === "dark"
        ? "light"
        : theme === "light"
        ? "dark"
        : checkDarkTheme
        ? "light"
        : "dark";
    setNewTheme(newThemeValue);
  }, []);

  useEffect(() => {
    setNewTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(newTheme ?? "dark")}
      className="flex flex-row items-center gap-3 group"
    >
      {/* Logo is the dark mode button */}
      <div className="w-[10px] h-[10px] bg-green group-hover:bg-gray-800 dark:group-hover:bg-white rounded-xl"></div>
      <div className="font-space font-medium text-lg tracking-tight dark:text-gray-200">
        El Punto
      </div>
    </button>
  );
}
