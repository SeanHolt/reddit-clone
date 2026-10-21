import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { RecentSubredditTracker } from "@/components/subreddit/RecentSubredditTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reddit Clone",
  description: "A full-stack Reddit clone built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Fixed: Class strings are now fully decoupled from conflicting root assignments */}
      <body className={`${inter.className} antialiased pt-16 min-h-screen`}>
        <Suspense fallback={null}>
          <RecentSubredditTracker />
        </Suspense>
        
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
