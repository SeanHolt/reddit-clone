"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AntiRaidConfigFormProps {
  subredditId: string;
  initialIsLocked: boolean;
  initialThreshold: number;
}

export function AntiRaidConfigForm({ subredditId, initialIsLocked, initialThreshold }: AntiRaidConfigFormProps) {
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [threshold, setThreshold] = useState(initialThreshold.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSaveAntiRaid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/subreddit/antiraid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subredditId,
          isLocked,
          autoRemoveThreshold: parseInt(threshold, 10) || 5,
        }),
      });

      if (!res.ok) throw new Error("Uplink failed to commit parameters.");
      
      alert("🔒 Anti-Raid safety parameters synchronized successfully!");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage("⚠️ Error saving security configuration changes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSaveAntiRaid} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 max-w-md transition-colors text-xs font-semibold text-gray-700 dark:text-gray-300">
      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1 select-none">
        🚨 Anti-Raid Shield Configuration
      </h3>
      
      <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 select-none">
        <span className="font-bold">Emergency Subreddit Lockdown</span>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setIsLocked(!isLocked)}
          className={`px-3 py-1 rounded-md font-black uppercase transition-all shadow-sm ${
            isLocked 
              ? "bg-red-600 text-white hover:bg-red-500 animate-pulse" 
              : "bg-gray-200 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {isLocked ? "🔒 Locked" : "🔓 Open"}
        </button>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 select-none">
          Auto-Remove Report Count Threshold
        </label>
        <input 
          type="number" 
          min="1" 
          max="50" 
          value={threshold} 
          onChange={(e) => setThreshold(e.target.value)} 
          disabled={isLoading} 
          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-red-500 font-bold" 
        />
      </div>

      {errorMessage && <p className="text-red-500 font-bold tracking-wide animate-shake">{errorMessage}</p>}

      <button 
        type="submit" 
        disabled={isLoading} 
        className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider rounded-lg transition shadow-sm disabled:opacity-40"
      >
        {isLoading ? "Saving Parameters..." : "Commit Anti-Raid Thresholds"}
      </button>
    </form>
  );
}
