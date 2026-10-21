"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GateConfigProps {
  subredditId: string;
  initialAge: number;
  initialKarma: number;
}

export function GateConfigForm({ subredditId, initialAge, initialKarma }: GateConfigProps) {
  const [ageDays, setAgeDays] = useState(initialAge.toString());
  const [minKarma, setMinKarma] = useState(initialKarma.toString());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSaveGates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit/gates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subredditId,
          minAccountAgeDays: parseInt(ageDays, 10) || 0,
          minKarmaRequired: parseInt(minKarma, 10) || 0,
        }),
      });

      if (!res.ok) throw new Error("Failed to commit gate parameters.");
      alert("Community safety restriction gates updated successfully!");
      router.refresh();
    } catch {
      alert("Error saving gate configuration thresholds.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveGates} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 max-w-md transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">🛡️ Community Entry Gates</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Min Age (Days)</label>
          <input type="number" min="0" value={ageDays} onChange={(e) => setAgeDays(e.target.value)} disabled={isLoading} className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Min Karma Required</label>
          <input type="number" min="0" value={minKarma} onChange={(e) => setMinKarma(e.target.value)} disabled={isLoading} className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500" />
        </div>
      </div>
      <button type="submit" disabled={isLoading} className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition shadow-sm">Update Gate Restrictions</button>
    </form>
  );
}
