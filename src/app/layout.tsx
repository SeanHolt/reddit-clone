import React, { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { RecentSubredditTracker } from "@/components/subreddit/RecentSubredditTracker";
import "./globals.css"; // Ensure standard Tailwind theme styles load across the app

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode; // Parallel slot anchor row to handle intercepted overlay windows
}

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50 transition-colors duration-200">
        {/* MOUNTED: Hydrate the active context tracker to monitor the last 3 visited subreddits */}
        <Suspense fallback={null}>
          <RecentSubredditTracker />
        </Suspense>

        {/* RESTORED: Centralized application shell navigation bar header */}
        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Render the parallel route modal overlay slot layer dynamically here */}
        {modal}
      </body>
    </html>
  );
}
