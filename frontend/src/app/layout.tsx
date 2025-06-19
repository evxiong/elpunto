import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "El Punto - News, simplified.",
  description:
    "The latest news headlines from across the web, all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${space_grotesk.variable} ${manrope.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="relative mx-auto max-w-screen-2xl px-4 sm:px-10 dark:bg-gray-800 dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <a
            href="#content"
            className="absolute left-4 top-0 z-50 -translate-y-full rounded-sm px-3 py-1 font-manrope text-[13px] font-medium text-gray-700 outline-none transition-all focus-visible:translate-y-0 focus-visible:bg-gray-800/5 focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-gray-300 sm:left-10 dark:text-gray-200 dark:focus-visible:bg-white/5 dark:focus-visible:outline-gray-500"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
