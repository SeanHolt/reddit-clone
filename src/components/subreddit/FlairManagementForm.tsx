"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FlairManagementForm({ subredditId }: { subredditId: string }) {
  const [text, setText] = useState("");
  const [bg, setBg] = useState("#f3f4f6");
  const [textColor, setTextColor] = useState("#1f2937");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateFlair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit/flair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId, text: text.trim(), backgroundColor: bg, textColor }),
      });

      if (!res.ok) throw new Error("Failed to spawn flair.");
      setText("");
      alert("Community User Flair added successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateFlair} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-2 max-w-md transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">🏷️ Create User Flair Options</h3>
      <div className="flex gap-2">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Expert" required className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100" />
        <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-8 rounded cursor-pointer bg-transparent border-none" title="Background Color" />
        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer bg-transparent border-none" title="Text Color" />
      </div>
      <button type="submit" disabled={isLoading || !text.trim()} className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-sm">Add Flair Variant</button>
    </form>
  );
}