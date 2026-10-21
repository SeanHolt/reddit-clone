"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TransferOwnershipForm({ subredditId, subredditName }: { subredditId: string; subredditName: string }) {
  const [targetUsername, setTargetUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;

    const confirmMessage = `⚠️ WARNING: Are you absolutely sure you want to transfer full ownership of r/${subredditName} to u/${targetUsername}? \n\nYou will instantly lose all moderator controls and administration rights over this community!`;
    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subreddit/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername: targetUsername.trim(), subredditId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to process transfer request.");
      }

      alert(`Ownership of r/${subredditName} successfully yielded!`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransferSubmit} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 max-w-md transition-colors">
      <h3 className="text-sm font-bold uppercase tracking-wide text-red-600 dark:text-red-400">🚨 Transfer Ownership</h3>
      <p className="text-[11px] text-gray-400">Yield all administration privileges permanently to another user handle.</p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={targetUsername}
          onChange={(e) => setTargetUsername(e.target.value.replace(/\s+/g, ""))}
          placeholder="New owner's username..."
          required
          disabled={isLoading}
          className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-red-500 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={isLoading || !targetUsername.trim()}
          className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 rounded-lg transition disabled:opacity-50 shadow-sm"
        >
          Transfer
        </button>
      </div>
      {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}
    </form>
  );
}
