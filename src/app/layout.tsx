import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/app/_components/navbar";
import { Space_Grotesk, Manrope } from "next/font/google";

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
  title: "El Punto",
  description: "Breaking news, aggregated",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${space_grotesk.variable} ${manrope.variable}`}>
      <body className="mx-auto max-w-screen-2xl px-6 sm:px-10">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
