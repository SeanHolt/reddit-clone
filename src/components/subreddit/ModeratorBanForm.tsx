"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModeratorBanForm({ subredditId }: { subredditId: string }) {
  const [username, setUsername] = useState("");
  const [type, setType] = useState<"BAN" | "TIMEOUT">("BAN");
  const [durationDays, setDurationDays] = useState("7");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleModerationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/moderation/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          subredditId,
          type,
          durationDays: type === "TIMEOUT" ? parseInt(durationDays, 10) : null,
          reason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to process moderation action.");
      }

      setUsername("");
      setReason("");
      alert(`User profile successfully restricted inside this community layout!`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleModerationSubmit} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 max-w-md transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">🛡️ Restrict User Access</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
          placeholder="Username (e.g. janesmith)"
          required
          className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "BAN" | "TIMEOUT")}
          className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-800 dark:text-gray-200 font-bold"
        >
          <option value="BAN">🚫 Permanent Ban</option>
          <option value="TIMEOUT">⏱️ Temp Timeout</option>
        </select>
      </div>

      {type === "TIMEOUT" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span>Suspension Length:</span>
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="px-2 py-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded"
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
          </select>
        </div>
      )}

      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for restriction (optional)"
        className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100"
      />

      {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || !username.trim()}
        className="w-full py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-sm"
      >
        {isLoading ? "Processing..." : "Enforce Action"}
      </button>
    </form>
  );
}