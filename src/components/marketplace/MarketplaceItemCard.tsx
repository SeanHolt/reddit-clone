"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MarketplaceItemCardProps {
  itemId: string;
  title: string;
  assetType: string;
  price: number;
  styleValue: string;
  creatorUsername: string;
  isOwned: boolean;
}

export function MarketplaceItemCard({ itemId, title, assetType, price, styleValue, creatorUsername, isOwned }: MarketplaceItemCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    if (isOwned || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const payload = await res.json();
        const { getFriendlyErrorMessage } = await import("@/lib/errors-dictionary");
        alert(getFriendlyErrorMessage(payload.code));
        return;
      }

      alert(`🎉 Successfully unlocked ${title}! It has been added to your profile inventory.`);
      router.refresh();
    } catch {
      alert("Error completing marketplace purchase connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col justify-between gap-3 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all hover:scale-[1.005]">
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-gray-400 select-none">
          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{assetType.replace("_", " ")}</span>
          <span>By u/{creatorUsername}</span>
        </div>
        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">{title}</h3>
      </div>

      {/* Live Sample Style Box Preview Area Slot */}
      <div className={`h-12 w-full rounded-lg border bg-gray-50/50 dark:bg-gray-950/20 flex items-center justify-center text-[10px] font-black uppercase text-gray-400 select-none ${styleValue}`}>
        Visual Asset Skin Preview
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-gray-50 dark:border-gray-800/60">
        <span className="font-mono font-black text-orange-600 text-sm select-none">{price} coins</span>
        <button
          type="button"
          disabled={isLoading || isOwned}
          onClick={handlePurchase}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
            isOwned
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default"
              : "bg-orange-600 hover:bg-orange-500 text-white shadow-xs"
          }`}
        >
          {isOwned ? "✓ Unlocked" : isLoading ? "Processing..." : "Purchase"}
        </button>
      </div>
    </div>
  );
}
