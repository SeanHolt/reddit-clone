"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SubmitPostForm({ subredditId, subredditName }: { subredditId: string; subredditName: string }) {
  const [postType, setPostType] = useState<"TEXT" | "POLL">("TEXT");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [files, setFiles] = useState<{ name: string; base64Data: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const STORAGE_KEY = `reddit_draft_post_${subredditId}`;

  // 1. On Mount: Hydrate layout text entries from local localStorage cache
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const { savedTitle, savedContent } = JSON.parse(savedDraft);
        if (savedTitle) setTitle(savedTitle);
        if (savedContent) setContent(savedContent);
      } catch (err) {
        console.error("DRAFT_HYDRATION_FAULT:", err);
      }
    }
  }, [STORAGE_KEY]);

  // 2. On Value Change: debounced sync text buffers back to browser storage
  useEffect(() => {
    if (!title.trim() && !content.trim()) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedTitle: title, savedContent: content }));
    }, 400);
    return () => clearTimeout(timer);
  }, [title, content, STORAGE_KEY]);

  // 3. RESTORED: Multi-Media File Base64 Array Processor Hook
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const chosenFiles = Array.from(e.target.files || []);
    chosenFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles((prev) => [...prev, { name: file.name, base64Data: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleOptionChange = (idx: number, val: string) => {
    setPollOptions((prev) => prev.map((opt, i) => (i === idx ? val : opt)));
  };
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;
    setError(null);

    const validPollOptions = pollOptions.map((o) => o.trim()).filter((o) => o.length > 0);
    if (postType === "POLL" && validPollOptions.length < 2) {
      setError("Please provide at least 2 distinct option choices to compile a poll.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: postType === "TEXT" ? content.trim() : null, postType, pollOptions: postType === "POLL" ? validPollOptions : [], subredditId, files: postType === "TEXT" ? files : [] }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Post submission failed.");
      }

      localStorage.removeItem(STORAGE_KEY);
      router.refresh();
      router.push(`/r/${subredditName}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error publishing post row.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmitPost} className="space-y-4 max-w-xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Post to r/{subredditName}</h2>
        <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-lg text-[10px] font-black uppercase tracking-wider select-none">
          <button type="button" onClick={() => setPostType("TEXT")} className={`px-3 py-1 rounded-md transition ${postType === "TEXT" ? "bg-orange-600 text-white shadow-sm" : "text-gray-400"}`}>📝 Text</button>
          <button type="button" onClick={() => setPostType("POLL")} className={`px-3 py-1 rounded-md transition ${postType === "POLL" ? "bg-orange-600 text-white shadow-sm" : "text-gray-400"}`}>📊 Poll</button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isLoading} placeholder="Title your post..." className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100 font-bold" />
      </div>

      {postType === "TEXT" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Body Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={isLoading} placeholder="What are your thoughts?..." rows={4} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100 resize-none font-sans" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase">Attach Media Files</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={isLoading} className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-700 dark:file:bg-gray-800 dark:file:text-gray-300 cursor-pointer" />
            {/* RESTORED: Image Upload Interactivity & High-Res Expansion Preview Mode Grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-3 border border-gray-100 dark:border-gray-800 p-3 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white shadow-sm">
                    <img src={f.base64Data} alt="Active preview" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full transition shadow-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase">Poll Options Choices</label>
          {pollOptions.map((option, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input type="text" value={option} onChange={(e) => handleOptionChange(idx, e.target.value)} required placeholder={`Option choice ${idx + 1}...`} disabled={isLoading} className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 font-semibold" />
              {pollOptions.length > 2 && <button type="button" onClick={() => setPollOptions((prev) => prev.filter((_, i) => i !== idx))} className="text-xs font-bold text-gray-400 hover:text-red-500 px-1">✕</button>}
            </div>
          ))}
          {pollOptions.length < 6 && <button type="button" onClick={() => setPollOptions((prev) => [...prev, ""])} className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider hover:underline pt-1">+ Add Option Choice</button>}
        </div>
      )}

      {/* RESTORED: Localized Validation Error Indicator Label */}
      {error && <p className="text-xs font-bold text-red-500 animate-shake">{error}</p>}
      <button type="submit" disabled={isLoading || !title.trim()} className="w-full bg-orange-600 hover:bg-orange-500 font-bold text-white rounded-full py-2 text-sm shadow-sm transition disabled:opacity-50">{isLoading ? "Publishing Thread..." : "Submit Post"}</button>
    </form>
  );
}
