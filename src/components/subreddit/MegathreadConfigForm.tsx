"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MegathreadConfigForm({ subredditId }: { subredditId: string }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit/megathread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId, title, url }),
      });

      if (!res.ok) throw new Error();
      alert("📌 Megathread sticky link pinned to top header successfully!");
      setTitle("");
      setUrl("");
      router.refresh();
    } catch {
      alert("Error saving megathread context parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddLink} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-2.5 max-w-md text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">🔗 Subreddit Megathread Hub</h3>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource Title (e.g., Rules & Guidelines)" required disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-bold" />
      <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Destination URL (https://...)" required disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-bold" />
      <button type="submit" disabled={isLoading} className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase rounded-lg transition shadow-sm">Pin Sticky Resource Link</button>
    </form>
  );
}
