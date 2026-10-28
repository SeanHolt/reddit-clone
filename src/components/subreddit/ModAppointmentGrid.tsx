"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModAppointmentGrid({ subredditId }: { subredditId: string }) {
  const [username, setUsername] = useState("");
  const [canBan, setCanBan] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAppointSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit/moderator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId, targetUsername: username.trim(), canBanUsers: canBan, canDeleteContent: canDelete, canEditSettings: canEdit }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to assign moderator privileges.");
      }

      alert(`Successfully configured moderator permissions for u/${username.trim()}!`);
      setUsername("");
      setCanBan(false);
      setCanDelete(false);
      setCanEdit(false);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAppointSubmit} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 max-w-md transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">⚔️ Appoint Co-Moderator</h3>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))} placeholder="Search username handle..." required disabled={isLoading} className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-semibold" />
      
      <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 select-none">
        <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"><input type="checkbox" checked={canBan} onChange={(e) => setCanBan(e.target.checked)} disabled={isLoading} className="accent-orange-600" /> Can Suspend / Ban Users</label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"><input type="checkbox" checked={canDelete} onChange={(e) => setCanDelete(e.target.checked)} disabled={isLoading} className="accent-orange-600" /> Can Purge Posts & Comments</label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200"><input type="checkbox" checked={canEdit} onChange={(e) => setCanEdit(e.target.checked)} disabled={isLoading} className="accent-orange-600" /> Can Edit AutoMod & Entry Gates</label>
      </div>

      <button type="submit" disabled={isLoading || !username.trim()} className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-sm">Commit Moderator Assignment</button>
    </form>
  );
}
