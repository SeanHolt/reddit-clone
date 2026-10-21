"use client";

import { useEffect } from "react";

export function PostViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    if (!postId) return;

    const fireViewImpression = async () => {
      try {
        await fetch("/api/posts/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
      } catch (err) {
        console.error("VIEW_IMPRESSION_LOG_FAULT:", err);
      }
    };

    fireViewImpression();
  }, [postId]);

  return null;
}