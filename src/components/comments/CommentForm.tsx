"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
}

export function CommentForm({ postId, parentId = null, onSuccess }: CommentFormProps) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"WRITE" | "PREVIEW">("WRITE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, postId, parentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to post comment.");
      }

      setText("");
      setMode("WRITE");
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    } finally { // <-- Fixed: Added missing finally statement explicitly
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Navigation Bar Selector Toggles Panel */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none">
          <button
            type="button"
            onClick={() => setMode("WRITE")}
            className={`px-4 py-2 border-r border-gray-200 transition-colors ${mode === "WRITE" ? "bg-white text-orange-600 font-extrabold" : "hover:text-gray-700 bg-gray-50/50"}`}
          >
            ✍️ Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("PREVIEW")}
            className={`px-4 py-2 transition-colors ${mode === "PREVIEW" ? "bg-white text-orange-600 font-extrabold" : "hover:text-gray-700 bg-gray-50/50"}`}
          >
            👁️ Preview
          </button>
        </div>

        {/* Dynamic Context Panels Input Area */}
        <div className="p-1.5">
          {mode === "WRITE" ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={parentId ? "Reply using markdown parameters..." : "What are your thoughts? (Supports ## headers, **bold**, > quotes, and `code` blocks)"}
              rows={parentId ? 2 : 4}
              disabled={isLoading}
              className="w-full text-sm p-2 border-none outline-none focus:ring-0 disabled:opacity-50 resize-none font-mono"
            />
          ) : (
            <div className="p-3 min-h-[96px] bg-white max-h-48 overflow-y-auto">
              {text.trim() ? <MarkdownRenderer content={text} /> : <p className="text-xs text-gray-400 italic">Nothing to preview yet.</p>}
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      
      <div className="flex justify-end">
        <button
          type="button"
          disabled={isLoading || !text.trim()}
          onClick={handleSubmit}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 px-5 text-xs rounded-full transition-all disabled:opacity-50 shadow-sm"
        >
          {isLoading ? "Posting..." : parentId ? "Reply" : "Comment"}
        </button>
      </div>
    </div>
  );
}
