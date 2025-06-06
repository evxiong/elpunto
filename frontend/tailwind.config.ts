import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        red: "#D24242",
        green: "#42D295",
        us: "#D24242",
        world: "#42B8D2",
        politics: "#9766ff",
        business: "#7dab94",
        tech: "#74c435",
        sports: "#4985fc",
        entertainment: "#D29842",
        science: "#f27d4b",
        health: "#D242A9",
      },
      fontFamily: {
        manrope: ["var(--font-manrope)", "ui-sans-serif", "system-ui"],
        space: ["var(--font-space-grotesk)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
