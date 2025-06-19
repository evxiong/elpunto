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
        vivo: "#42D295",
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
