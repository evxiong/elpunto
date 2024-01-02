import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { Providers } from "./providers";

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
  description: "News, simplified.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${space_grotesk.variable} ${manrope.variable}`}>
      <body className="mx-auto max-w-screen-2xl px-4 sm:px-10 dark:bg-gray-800 dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
