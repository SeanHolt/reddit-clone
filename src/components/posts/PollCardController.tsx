"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OptionItem {
  id: string;
  text: string;
  _count: { votes: number };
}

interface PollCardControllerProps {
  postId: string;
  initialOptions: OptionItem[];
  userVoteOptionId: string | null;
  hasUser: boolean;
}

export function PollCardController({ postId, initialOptions, userVoteOptionId, hasUser }: PollCardControllerProps) {
  const [options, setOptions] = useState<OptionItem[]>(initialOptions);
  const [selectedId, setSelectedId] = useState<string | null>(userVoteOptionId);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const totalVotes = options.reduce((acc, curr) => acc + curr._count.votes, 0);

  const handleCastPollVote = async (optionId: string) => {
    if (!hasUser) return alert("Log in to participate in this poll!");
    if (isLoading || selectedId === optionId) return;

    setIsLoading(true);
    const originalOptions = [...options];
    const originalSelected = selectedId;

    // Optimistically update metrics arrays instantly locally before network transactions complete
    setSelectedId(optionId);
    setOptions((prev) =>
      prev.map((opt) => {
        let voteCount = opt._count.votes;
        if (opt.id === originalSelected) voteCount = Math.max(0, voteCount - 1);
        if (opt.id === optionId) voteCount += 1;
        return { ...opt, _count: { votes: voteCount } };
      })
    );

    try {
      const res = await fetch("/api/posts/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, postId })
      });

      if (!res.ok) throw new Error("Failed to post vote.");
      router.refresh();
    } catch {      // Automatic fallback rollback states on transaction transmission failure
      setSelectedId(originalSelected);
      setOptions(originalOptions);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2 border border-gray-100 dark:border-gray-800/80 p-4 bg-gray-50/30 dark:bg-gray-950/10 rounded-xl max-w-md select-none transition-colors">
      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-gray-400 mb-1">
        <span>📊 Interactive Survey Poll</span>
        <span>{totalVotes} Total Votes</span>
      </div>
      <div className="space-y-2">
        {options.map((opt) => {
          const percentage = totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0;
          const isMyVote = selectedId === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleCastPollVote(opt.id)}
              className="w-full relative overflow-hidden h-10 border border-gray-200 dark:border-gray-800 rounded-lg text-left text-xs font-bold transition hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200"
            >
              {/* Responsive progress visualization overlay filling the background element layout blocks */}
              <div 
                className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out ${isMyVote ? "bg-orange-600/15" : "bg-gray-100 dark:bg-gray-800/50"}`}
                style={{ width: `${percentage}%` }}
              />
              <div className="absolute inset-0 px-4 flex items-center justify-between z-10">
                <span className="truncate flex items-center gap-1.5">
                  {isMyVote && <span className="text-orange-600">✓</span>}
                  {opt.text}
                </span>
                <span className="text-gray-400 font-mono font-black">{percentage}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
