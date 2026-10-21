"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AutoModConfigForm({ subredditId, initialKeywords }: { subredditId: string; initialKeywords: string }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSaveAutoMod = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit/automod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId, keywords }),
      });

      if (!res.ok) throw new Error("Failed to commit configuration matrix rules.");
      alert("AutoMod keyword filters updated successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving your keyword parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveAutoMod} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-2 max-w-md transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">🤖 AutoMod Word Filter</h3>
      <p className="text-[11px] text-gray-400">Block posts containing specific phrases. Separate terms using commas.</p>
      <input
        type="text"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="spam, crypto, giveaway"
        disabled={isLoading}
        className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-sm"
      >
        {isLoading ? "Saving Rules..." : "Update AutoMod Settings"}
      </button>
    </form>
  );
}
