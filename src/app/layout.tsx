import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TransitionLayout from "@/components/animations/TransitionLayout";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Home Show at Nexus Center",
  description: "The official website for the Home Show at Nexus Center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <TransitionLayout>{children}</TransitionLayout>
      </body>
    </html>
  );
}
