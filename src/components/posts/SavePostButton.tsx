"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SavePostButton({ postId, initialSaved, hasUser }: { postId: string; initialSaved: boolean; hasUser: boolean }) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasUser) return alert("Log in to save posts to your vault!");
    if (isLoading) return;

    setIsLoading(true);
    setIsSaved(!isSaved); // Optimistic UI flip

    try {
      const res = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) throw new Error();
      router.refresh();
    } catch (err) {
      setIsSaved(isSaved); // Revert back on mutation network fault
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleSave}
      className={`text-xs font-semibold px-2 py-1 rounded transition select-none ${
        isSaved ? "text-orange-600 bg-orange-50/50 dark:bg-orange-950/20 font-bold" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      🔖 {isSaved ? "Saved" : "Save"}
    </button>
  );
}
