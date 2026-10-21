"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VoteControllerProps {
  targetId: string;
  targetType: "POST" | "COMMENT";
  initialScore: number;
  currentVote: "UP" | "DOWN" | null;
  hasUser: boolean;
}

export function VoteController({ targetId, targetType, initialScore, currentVote, hasUser }: VoteControllerProps) {
  const [vote, setVote] = useState<"UP" | "DOWN" | null>(currentVote);
  const [score, setScore] = useState(initialScore);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVote = async (type: "UP" | "DOWN") => {
    if (!hasUser) {
      router.push("/login");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    let scoreDiff = 0;

    // Optimistic UI state calculation matrix
    if (vote === type) {
      setVote(null);
      scoreDiff = type === "UP" ? -1 : 1;
    } else if (vote !== null) {
      setVote(type);
      scoreDiff = type === "UP" ? 2 : -2;
    } else {
      setVote(type);
      scoreDiff = type === "UP" ? 1 : -1;
    }

    setScore((prev) => prev + scoreDiff);

    try {
      const res = await fetch("/api/posts/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, targetType, voteType: type }),
      });

      if (!res.ok) throw new Error("Vote failed");
      router.refresh();
    } catch {
      // Revert optimistic values on failure
      setVote(currentVote);
      setScore(initialScore);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 w-10 bg-gray-50/50 p-2 rounded-l-xl border-r border-gray-100">
      <button onClick={() => handleVote("UP")} className={`p-1 rounded hover:bg-gray-200 transition ${vote === "UP" ? "text-orange-600 font-bold" : "text-gray-400"}`}>
        ▲
      </button>
      <span className={`text-xs font-semibold ${vote === "UP" ? "text-orange-600" : vote === "DOWN" ? "text-blue-600" : "text-gray-700"}`}>
        {score}
      </span>
      <button onClick={() => handleVote("DOWN")} className={`p-1 rounded hover:bg-gray-200 transition ${vote === "DOWN" ? "text-blue-600 font-bold" : "text-gray-400"}`}>
        ▼
      </button>
    </div>
  );
}
