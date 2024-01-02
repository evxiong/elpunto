import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
        politics: "#7042D2",
        business: "#666666",
        tech: "#81D242",
        sports: "#4284D2",
        entertainment: "#D29842",
        science: "#4250D2",
        health: "#D242A9",
      },
      fontFamily: {
        // graphik: ['var(--font-graphik)', 'ui-sans-serif', 'system-ui'],
        manrope: ["var(--font-manrope)", "ui-sans-serif", "system-ui"],
        space: ["var(--font-space-grotesk)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
