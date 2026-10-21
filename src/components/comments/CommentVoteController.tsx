"use client";

import { useState } from "react";

interface CommentVoteProps {
  commentId: string;
  initialScore: number;
  currentVote: "UP" | "DOWN" | null;
  hasUser: boolean;
}

export function CommentVoteController({ commentId, initialScore, currentVote, hasUser }: CommentVoteProps) {
  const [vote, setVote] = useState<"UP" | "DOWN" | null>(currentVote);
  const [score, setScore] = useState(initialScore);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (clickedType: "UP" | "DOWN") => {
    if (!hasUser) return alert("Log in to cast your community vote!");
    if (isLoading) return;

    // 1. Calculate the new vote state and score delta optimistically
    const oldVote = vote;
    const oldScore = score;
    
    let newVote: "UP" | "DOWN" | null = clickedType;
    let scoreDelta = 0;

    if (oldVote === clickedType) {
      newVote = null;
      scoreDelta = clickedType === "UP" ? -1 : 1;
    } else {
      if (oldVote === "UP") scoreDelta -= 1;
      if (oldVote === "DOWN") scoreDelta += 1;
      scoreDelta += clickedType === "UP" ? 1 : -1;
    }

    // 2. Instantly update local layout states before launching network requests
    setVote(newVote);
    setScore(oldScore + scoreDelta);
    setIsLoading(true);

    try {
      const res = await fetch("/api/posts/comment/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, type: clickedType }),
      });

      if (!res.ok) throw new Error("Vote registration failed.");
    } catch (err) {
      console.error("VOTE_FAULT:", err);
      // 3. Fallback: Automatically roll back to the original values on network failure
      setVote(oldVote);
      setScore(oldScore);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs font-black text-gray-400 select-none">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleVote("UP")}
        className={`hover:text-orange-600 transition p-1 rounded ${vote === "UP" ? "text-orange-600 font-bold" : ""}`}
        title="Upvote comment"
      >
        ▲
      </button>
      <span className={`px-0.5 min-w-[12px] text-center ${vote === "UP" ? "text-orange-600" : vote === "DOWN" ? "text-blue-500" : "text-gray-500"}`}>
        {score}
      </span>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleVote("DOWN")}
        className={`hover:text-blue-500 transition p-1 rounded ${vote === "DOWN" ? "text-blue-500 font-bold" : ""}`}
        title="Downvote comment"
      >
        ▼
      </button>
    </div>
  );
}