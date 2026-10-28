"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface InventoryAssetItem {
  id: string;
  isEquipped: boolean;
  item: { id: string; title: string; assetType: string; styleValue: string };
}

export function InventoryToggleGrid({ initialAssets }: { initialAssets: InventoryAssetItem[] }) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleEquip = async (assetId: string) => {
    setIsLoading(assetId);
    try {
      const res = await fetch("/api/marketplace/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
      {initialAssets.map((asset) => (
        <div key={asset.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col justify-between gap-3 transition-colors duration-200">
          <div className="space-y-1">
            <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-gray-400 select-none">
              {asset.item.assetType.replace("_", " ")}
            </span>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 mt-1">{asset.item.title}</h3>
          </div>

          <div className={`h-12 w-full rounded-lg border bg-gray-50/50 dark:bg-gray-950/20 flex items-center justify-center text-[10px] font-black uppercase text-gray-400 select-none ${asset.item.styleValue}`}>
            Live Skin Preview Output
          </div>

          <button
            type="button"
            disabled={isLoading !== null}
            onClick={() => handleToggleEquip(asset.id)}
            className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
              asset.isEquipped
                ? "bg-red-600 hover:bg-red-500 text-white shadow-xs"
                : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 text-white shadow-xs"
            }`}
          >
            {isLoading === asset.id ? "Syncing..." : asset.isEquipped ? "✕ Unequip Asset" : "⚡ Equip Cosmetic"}
          </button>
        </div>
      ))}
    </div>
  );
}
