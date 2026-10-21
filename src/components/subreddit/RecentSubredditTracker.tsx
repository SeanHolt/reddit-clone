"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RecentSubredditTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Detect if the user is visiting a community page (/r/[slug])
    const match = pathname.match(/^\/r\/([^/]+)$/);
    if (!match) return;

    const slug = match[1];
    const stored = localStorage.getItem("reddit_recent_subs");
    let list: string[] = stored ? JSON.parse(stored) : [];

    // Filter out duplicates and add the fresh slug to the top
    list = [slug, ...list.filter((item) => item !== slug)];

    if (list.length > 3) {
      list = list.slice(0, 3);
    }

    localStorage.setItem("reddit_recent_subs", JSON.stringify(list));

    // Dispatch a standard custom event so the Navbar dropdown immediately updates
    window.dispatchEvent(new Event("recent_subs_updated"));
  }, [pathname]);

  return null;
}
