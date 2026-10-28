"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORM_AWARDS, AwardTier } from "@/lib/awards-config";
import { getFriendlyErrorMessage } from "@/lib/errors-dictionary";

interface AwardDrawerProps {
  postId: string;
  hasUser: boolean;
  onClose: () => void;
}

export function AwardDrawer({ postId, hasUser, onClose }: AwardDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchaseAward = async (tier: AwardTier) => {
    if (!hasUser) return alert("Please log in to gift awards!");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/posts/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, awardType: tier }),
      });

      if (!res.ok) {
        const payload = await res.json();
        setError(getFriendlyErrorMessage(payload.code));
        setIsLoading(false);
        return;
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError("⚠️ Failed to complete payment connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-xl text-xs font-semibold" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center select-none">
          <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">🏆 Gift Content Award</h4>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold font-mono">✕</button>
        </div>
        <p className="text-gray-400 font-medium">Select an award tier token to highlight this author&apos;s contribution stream.</p>
        
        <div className="space-y-2">
          {(Object.keys(PLATFORM_AWARDS) as AwardTier[]).map((key) => {
            const award = PLATFORM_AWARDS[key];
            return (
              <button
                key={key}
                type="button"
                disabled={isLoading}
                onClick={() => handlePurchaseAward(key)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-orange-500 dark:hover:border-orange-500 bg-gray-50/50 dark:bg-gray-950/20 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-900 transition disabled:opacity-50 text-left"
              >
                <span className="font-bold text-sm">{award.label}</span>
                <span className="font-mono font-black text-orange-600">{award.cost} coins</span>
              </button>
            );
          })}
        </div>
        {error && <p className="text-red-500 font-bold leading-tight animate-shake">{error}</p>}
      </div>
    </div>
  );
}
