"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateCommunityForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#ea580c");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, bannerUrl, accentColor }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create community.");
      }

      router.refresh();
      router.push(`/r/${name}`);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create a new community</h2>
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value.replace(/\s+/g, ""))} placeholder="communityname" className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your community..." rows={3} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Banner Image URL</label>
          <input type="text" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Theme Accent Color</label>
          <div className="flex gap-2">
            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-9 w-12 p-0.5 border border-gray-300 dark:border-gray-800 rounded-lg cursor-pointer bg-transparent" />
            <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} placeholder="#ea580c" className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100" />
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-full py-2 text-sm font-semibold transition disabled:opacity-50 shadow-sm">Create</button>
    </form>
  );
}