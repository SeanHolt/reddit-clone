"use client";

import { useState, useEffect } from "react";

interface SharePostButtonProps {
  postId: string;
}

export function SharePostButton({ postId }: SharePostButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleShareCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      // Build a clean tracking link pointing straight to the target route path destination
      const shareUrl = `${window.location.origin}/share/${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (err) {
      console.error("CLIPBOARD_API_WRITE_FAULT:", err);
    }
  };

  return (
    <div className="relative inline-block select-none">
      <button
        type="button"
        onClick={handleShareCopy}
        className="text-xs font-black uppercase tracking-wider text-gray-400 hover:text-orange-600 transition-colors py-1 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-1"
        title="Copy tracking share link to clipboard"
      >
        🔗 {copied ? "Link Copied!" : "Share"}
      </button>

      {/* Floating Animated Micro-Tooltip Indicator Status Alert */}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-950 text-white dark:bg-white dark:text-gray-950 text-[10px] font-black px-2 py-1 rounded shadow-md animate-fadeIn whitespace-nowrap z-30">
          ✓ Copied to Clipboard!
        </span>
      )}
    </div>
  );
}
