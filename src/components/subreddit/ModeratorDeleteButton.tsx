"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ModeratorDeleteButtonProps {
  postId: string;
}

export function ModeratorDeleteButton({ postId }: ModeratorDeleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleModerateDelete = async () => {
    if (!confirm("Are you sure you want to remove this post as a moderator?")) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      console.log("Moderation delete response:", res);
      if (!res.ok) {
        throw new Error("Failed to moderate post.");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error processing moderation command.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleModerateDelete}
      className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition disabled:opacity-50 select-none"
    >
      {isLoading ? "Removing..." : "🛡️ Remove Post"}
    </button>
  );
}
