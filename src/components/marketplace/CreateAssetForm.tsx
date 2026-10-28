"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFriendlyErrorMessage } from "@/lib/errors-dictionary";

export function CreateAssetForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState("BORDER_GLOW");
  const [styleValue, setStyleValue] = useState("");
  const [price, setPrice] = useState("100");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePublishAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !styleValue.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/marketplace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, assetType, styleValue, price }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.code || "SERVER_CRASH");
      }

      alert("🎨 Custom digital asset published to the Creator Marketplace successfully!");
      setTitle("");
      setDescription("");
      setStyleValue("");
      setPrice("100");
      router.refresh();
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err instanceof Error ? err.message : "SERVER_CRASH"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handlePublishAsset} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 max-w-md text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide select-none">🎨 List New Marketplace Creation</h3>
      
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 select-none">Asset Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Solar Flare Glow Skin" disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-bold" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 select-none">Asset Category</label>
          <select value={assetType} onChange={(e) => setAssetType(e.target.value)} disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 font-bold cursor-pointer focus:ring-1 focus:ring-orange-500">
            <option value="BORDER_GLOW">✨ Border Glow</option>
            <option value="FONT_STYLE">🔤 Font Style</option>
            <option value="BADGE">🏅 Custom Badge</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 select-none">Coin Price (10 - 5000)</label>
          <input type="number" min="10" max="5000" value={price} onChange={(e) => setPrice(e.target.value)} required disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-bold" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 select-none">Tailwind / CSS Class Design Configuration</label>
        <input type="text" value={styleValue} onChange={(e) => setStyleValue(e.target.value)} required placeholder="e.g., border-orange-500 shadow-lg text-orange-600 font-bold" disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-mono font-medium" />
      </div>

      {error && <p className="text-red-500 font-bold tracking-wide animate-shake">{error}</p>}
      <button type="submit" disabled={isLoading || !title.trim() || !styleValue.trim()} className="w-full py-2 bg-orange-600 hover:bg-orange-500 font-black text-white uppercase tracking-wider rounded-lg transition disabled:opacity-40 shadow-sm">Publish Custom Asset</button>
    </form>
  );
}
