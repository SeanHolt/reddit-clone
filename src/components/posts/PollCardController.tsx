"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Strict structural sub-type interface matching our Prisma inclusion payload matrix
interface PollOptionWithVotes {
  id: string;
  text: string;
  postId: string;
  createdAt: Date;
  votes: {
    userId: string;
  }[];
}

interface PollCardControllerProps {
  postId: string;
  pollOptions: PollOptionWithVotes[]; // Aligned perfectly with our feed data schemas
  currentUserId: string | null | undefined;
}

export function PollCardController({ postId, pollOptions, currentUserId }: PollCardControllerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  if (!pollOptions || pollOptions.length === 0) return null; // Guard against empty poll data
  // 1. Verify if the active viewer has already cast a ballot inside this poll
  const hasUserVoted = pollOptions.some((opt) => 
    opt.votes.some((v) => v.userId === currentUserId)
  );

  // 2. Aggregate the cumulative total of all cast survey votes
  const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);

  const handleCastVote = async (optionId: string) => {
    if (!currentUserId) return alert("Please log in to participate in community polls!");
    if (isLoading || hasUserVoted) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/posts/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, optionId }),
      });

      if (!res.ok) throw new Error();
      
      router.refresh();
    } catch {
      alert("Error recording your poll selection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-xl space-y-2.5 max-w-md select-none text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-wider">
        <span>📊 Community Survey Poll</span>
        <span className="font-mono">{totalVotes} votes cast</span>
      </div>

      <div className="space-y-2">
        {pollOptions.map((opt) => {
          const voteCount = opt.votes.length;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <div key={opt.id} className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-9">
              {/* Fluid Progress Bar Filling Track Visual Layer */}
              {hasUserVoted && (
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-orange-500/10 dark:bg-orange-500/15 transition-all duration-500" 
                  style={{ width: `${percentage}%` }} 
                />
              )}

              <button
                type="button"
                disabled={isLoading || hasUserVoted}
                onClick={() => handleCastVote(opt.id)}
                className="absolute inset-0 w-full h-full px-3 flex items-center justify-between text-left hover:text-orange-600 dark:hover:text-orange-400 transition-colors disabled:cursor-default"
              >
                <span className="font-bold truncate pr-4">{opt.text}</span>
                {hasUserVoted && <span className="font-mono font-black text-orange-600">{percentage}%</span>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
