"use client";

import { useTheme } from "next-themes";

export default function Logo() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      role="button"
      aria-label="Theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="group -mx-3 -my-1 flex flex-row items-center gap-3 rounded-sm px-3 py-1 outline-none transition-all focus-visible:bg-gray-800/5 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 dark:focus-visible:bg-white/5 dark:focus-visible:outline-gray-500"
    >
      {/* Logo is the dark mode button */}
      <div className="bg-vivo h-[10px] w-[10px] rounded-xl transition-all group-hover:bg-gray-800 group-focus-visible:bg-gray-800 dark:group-hover:bg-white dark:group-focus-visible:bg-white"></div>
      <div className="font-space text-lg font-medium tracking-tight text-gray-800 dark:text-gray-200">
        El Punto
      </div>
    </button>
  );
}
