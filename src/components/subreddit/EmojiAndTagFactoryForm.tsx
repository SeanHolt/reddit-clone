"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EmojiAndTagFactoryForm({ subredditId }: { subredditId: string }) {
  const [shortcode, setShortcode] = useState("");
  const [tagLabel, setTagLabel] = useState("");
  const [bgHex, setBgHex] = useState("#ea580c");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUploadEmoji = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shortcode.trim()) return alert("Provide a shortcode text marker first!");
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/subreddit/emoji", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subredditId, shortcode, file: { base64Data: reader.result as string } }),
        });
        if (res.ok) { alert("Custom shortcode emoji committed successfully!"); setShortcode(""); }
        router.refresh();
      } catch { alert("Error uploading emoji asset."); }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagLabel.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/subreddit/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId, label: tagLabel, bgHex, textHex: "#ffffff" }),
      });
      if (res.ok) { alert("Custom post tag registered successfully!"); setTagLabel(""); }
      router.refresh();
    } catch { alert("Error writing tag row."); }
    setIsLoading(false);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl space-y-4 max-w-md transition-colors text-xs font-semibold">
      <div className="space-y-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <h4 className="text-gray-900 dark:text-gray-100 uppercase tracking-wide">🎨 Custom Emoji Pack Factory</h4>
        <input type="text" value={shortcode} onChange={(e) => setShortcode(e.target.value.replace(/\s+/g, ""))} placeholder="shortcode (e.g. hype)" className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100" />
        <input type="file" accept="image/*" onChange={handleUploadEmoji} disabled={isLoading || !shortcode.trim()} className="w-full cursor-pointer text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-orange-50 file:text-orange-700" />
      </div>
      <form onSubmit={handleCreateTag} className="space-y-2">
        <h4 className="text-gray-900 dark:text-gray-100 uppercase tracking-wide">🏷️ Create Subreddit Tag Variant</h4>
        <div className="flex gap-2">
          <input type="text" value={tagLabel} onChange={(e) => setTagLabel(e.target.value)} placeholder="Tag Label (e.g. Bug Report)" required className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100" />
          <input type="color" value={bgHex} onChange={(e) => setBgHex(e.target.value)} className="h-8 w-8 cursor-pointer border-0 p-0 rounded bg-transparent" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition">Register Community Tag</button>
      </form>
    </div>
  );
}
