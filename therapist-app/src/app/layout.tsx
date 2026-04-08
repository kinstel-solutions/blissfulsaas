import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blissful Station | Provider Ecosystem",
  description: "A high-end, editorial experience for mental health practitioners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${manrope.variable} ${inter.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
