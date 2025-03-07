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
  description: "The latest headlines from across the web, all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${space_grotesk.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <body className="mx-auto max-w-screen-2xl px-4 dark:bg-gray-800 dark:text-white sm:px-10">
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
