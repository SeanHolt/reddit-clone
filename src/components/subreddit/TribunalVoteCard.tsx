"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TribunalVoteCardProps {
  caseId: string;
  subredditName: string;
  targetUsername: string;
  appealReason: string;
  banReason: string;
}

export function TribunalVoteCard({ caseId, subredditName, targetUsername, appealReason, banReason }: TribunalVoteCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const router = useRouter();

  const handleCastBallot = async (type: "UPHOLD" | "OVERTURN") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tribunal/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, voteType: type }),
      });

      if (!res.ok) throw new Error();
      setHasVoted(true);
      alert("🗳️ Anonymous jury ballot recorded successfully!");
      router.refresh();
    } catch {
      alert("Error submitting tribunal ballot.");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasVoted) {
    return <div className="p-4 bg-gray-50 dark:bg-gray-950 text-center rounded-xl border text-gray-400 text-xs font-bold italic select-none">Thank you for your civic service. Your anonymous vote has been compiled.</div>;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-300">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-orange-600 tracking-wide select-none">
        <span>⚖️ Active Tribunal Appeal Case</span>
        <span>r/{subredditName}</span>
      </div>
      
      <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800">
        <p><span className="text-gray-400 uppercase text-[9px] font-black block">Accused Handle</span> u/{targetUsername}</p>
        <p><span className="text-gray-400 uppercase text-[9px] font-black block">Original Ban Reason</span> {banReason}</p>
        <p><span className="text-gray-400 uppercase text-[9px] font-black block">User Appeal Defense Statement</span> &quot;{appealReason}&quot;</p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button type="button" disabled={isLoading} onClick={() => handleCastBallot("UPHOLD")} className="py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-950 font-bold rounded-lg transition hover:opacity-90 shadow-sm">Uphold Mod Ban</button>
        <button type="button" disabled={isLoading} onClick={() => handleCastBallot("OVERTURN")} className="py-2 bg-orange-600 text-white font-bold rounded-lg transition hover:bg-orange-500 shadow-sm">Overturn Ban & Absolve</button>
      </div>
    </div>
  );
}
