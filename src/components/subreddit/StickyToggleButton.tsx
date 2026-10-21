"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StickyToggleButtonProps {
  postId: string;
  isSticky: boolean;
}

export function StickyToggleButton({ postId, isSticky }: StickyToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleSticky = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      const res = await fetch("/api/posts/sticky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to toggle sticky state.");
      }

      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating post pin state.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleToggleSticky}
      className={`text-xs font-bold px-3 py-1 rounded-md transition select-none ${
        isSticky 
          ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900" 
          : "text-gray-400 hover:text-orange-600 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {isLoading ? "Updating..." : isSticky ? "📌 Pinned" : "📌 Pin Post"}
    </button>
  );
}