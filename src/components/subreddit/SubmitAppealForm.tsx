"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFriendlyErrorMessage } from "@/lib/errors-dictionary";

interface BannedSubredditItem {
  id: string; // ModerationAction ID
  subredditId: string;
  subredditName: string;
  banReason: string;
}

interface SubmitAppealFormProps {
  bannedCommunities: BannedSubredditItem[];
}

export function SubmitAppealForm({ bannedCommunities }: SubmitAppealFormProps) {
  const [actionId, setActionId] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionId || !reason.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    const selectedBan = bannedCommunities.find((b) => b.id === actionId);
    if (!selectedBan) return setIsLoading(false);

    try {
      const res = await fetch("/api/tribunal/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionId,
          subredditId: selectedBan.subredditId,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.code || "SERVER_CRASH");
      }

      alert("⚖️ Your ban dispute case has been assigned to the crowd-sourced jury tribunal pipeline!");
      setReason("");
      setActionId("");
      router.refresh();
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err instanceof Error ? err.message : "SERVER_CRASH"));
    } finally {
      setIsLoading(false);
    }
  };

  if (bannedCommunities.length === 0) {
    return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-gray-400 text-xs font-bold italic select-none">✨ Your account record is pristine! You are not currently suspended from any community spaces.</div>;
  }

  return (
    <form onSubmit={handleFormSubmit} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 max-w-md text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide select-none">⚖️ Appeal Active Enforcement Ban</h3>
      
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 select-none">Select Suspended Subreddit</label>
        <select value={actionId} onChange={(e) => setActionId(e.target.value)} required disabled={isLoading} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-bold cursor-pointer">
          <option value="">-- Choose Subreddit Code --</option>
          {bannedCommunities.map((b) => (
            <option key={b.id} value={b.id}>r/{b.subredditName} (Reason: {b.banReason})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 select-none">Your Defense Statement / Appeal Justification</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Provide clear reasoning why your ban should be overturned by peer community members..." rows={4} disabled={isLoading} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 resize-none font-sans font-medium" />
      </div>

      {error && <p className="text-red-500 font-bold tracking-wide animate-shake">{error}</p>}
      <button type="submit" disabled={isLoading || !actionId || !reason.trim()} className="w-full py-2 bg-orange-600 hover:bg-orange-500 font-black text-white uppercase tracking-wider rounded-lg transition disabled:opacity-40 shadow-sm">Submit Appeal to Tribunal</button>
    </form>
  );
}
