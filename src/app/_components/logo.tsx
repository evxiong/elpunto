"use client";

import { useTheme } from "next-themes";

export default function Logo() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
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
