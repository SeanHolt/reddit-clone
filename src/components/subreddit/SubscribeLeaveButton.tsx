"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubscribeLeaveButtonProps {
  subredditId: string;
  isSubscribed: boolean;
}

export function SubscribeLeaveButton({ subredditId, isSubscribed }: SubscribeLeaveButtonProps) {
  const [isFollowing, setIsFollowing] = useState(isSubscribed);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleSubscription = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId }),
      });
      console.log("Subscription toggle response:", res);
      if (!res.ok) {
        throw new Error("Failed to change subscription status.");
      }

      // Flip the state immediately for responsive feedback
      setIsFollowing((prev) => !prev);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSubscription}
      disabled={isLoading}
      className={`w-full py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-50 ${
        isFollowing
          ? "border border-gray-300 text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          : "bg-orange-600 text-white hover:bg-orange-500"
      }`}
    >
      {isLoading ? "Updating..." : isFollowing ? "Leave" : "Join"}
    </button>
  );
}
