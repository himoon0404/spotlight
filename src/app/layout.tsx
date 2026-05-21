import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AIChatbot } from "@/components/AIChatbot";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPOTLIGHT",
  description: "오늘의 공연을 발견하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-[#0c0c0c] text-white antialiased">
        <Navigation />
        {children}
        <AIChatbot />
      </body>
    </html>
  );
}
