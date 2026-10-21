"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserFlair } from "@prisma/client";

export function MemberFlairSelector({ subredditId, availableFlairs, currentFlair }: { subredditId: string; availableFlairs: UserFlair[]; currentFlair: string }) {
  const [selected, setSelected] = useState(currentFlair);
  const [, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectFlair = async (flairText: string) => {
    setIsLoading(false);
    setSelected(flairText);
    try {
      await fetch("/api/subreddit/flair", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId, flairText }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (availableFlairs.length === 0) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs font-medium">
      <label className="text-gray-400 font-bold block uppercase tracking-wider text-[10px]">Select User Flair</label>
      <select value={selected} onChange={(e) => handleSelectFlair(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-800 dark:text-gray-200 font-bold outline-none">
        <option value="">No Flair Badge Set</option>
        {availableFlairs.map((f) => (
          <option key={f.id} value={f.text}>{f.text}</option>
        ))}
      </select>
    </div>
  );
}