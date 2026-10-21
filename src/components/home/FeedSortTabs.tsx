"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function FeedSortTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("feed") || "popular"; // Default feed falls back to global popular trends

  const handleTabChange = (tab: "home" | "popular") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("feed", tab);
    params.delete("cursor"); // Flush old cursor markers to refresh page boundaries cleanly
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl p-1 shadow-sm max-w-xs select-none">
      <button
        type="button"
        onClick={() => handleTabChange("popular")}
        className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
          activeTab === "popular"
            ? "bg-orange-600 text-white shadow-sm"
            : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        🔥 Popular
      </button>
      <button
        type="button"
        onClick={() => handleTabChange("home")}
        className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
          activeTab === "home"
            ? "bg-orange-600 text-white shadow-sm"
            : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        🏠 Home
      </button>
    </div>
  );
}