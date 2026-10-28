"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";

interface SubmitPostFormProps {
    subredditId: string;
    subredditName: string;
}

export function SubmitPostForm({ subredditId, subredditName }: SubmitPostFormProps) {
    const [postType, setPostType] = useState<"TEXT" | "POLL">("TEXT");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
    const [files, setFiles] = useState<{ name: string; base64Data: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeWriteMode, setActiveWriteMode] = useState<"WRITE" | "PREVIEW">("WRITE");
    const [selectedTagId, setSelectedTagId] = useState<string>("");
    const [availableTags, setAvailableTags] = useState<{ id: string; label: string; bgHex: string }[]>([]);

    const router = useRouter();

    const STORAGE_KEY = `reddit_draft_post_${subredditId}`;

    // 1. Caching Hydration: On Mount, fetch existing text buffers from browser storage
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
    useEffect(() => {
        if (!subredditId) return;

        const loadTagsFromApi = async () => {
            try {
                const res = await fetch(`/api/subreddit/tags/list?subredditId=${subredditId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableTags(data);
                }
            } catch (err) {
                console.error("TAG_CLIENT_FETCH_FAULT:", err);
            }
        };

        loadTagsFromApi();
    }, [subredditId]);
    // 2. Debounced Persist: Automatically track input string buffers dynamically
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

    // 3. Multi-Media File Base64 Array Processor
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
    const renderSimpleMarkdownPreview = (rawText: string) => {
        if (!rawText.trim()) return <p className="text-gray-400 italic text-xs">Nothing to preview yet. Type text to trace adjustments...</p>;

        return rawText.split("\n").map((line, i) => {
            if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-extrabold text-gray-900 dark:text-gray-50 mt-2 mb-1">{line.slice(2)}</h1>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1 mb-1">{line.slice(3)}</h2>;
            if (line.startsWith("- ")) return <li key={i} className="list-disc list-inside ml-2 text-gray-700 dark:text-gray-300">{line.slice(2)}</li>;
            return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed min-h-[1.25rem]">{line}</p>;
        });
    };
    const handleOptionChange = (idx: number, val: string) => {
        setPollOptions((prev) => prev.map((opt, i) => (i === idx ? val : opt)));
    };
    const handleSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isLoading) return;
        setError(null);

        // FIXED: Enforce strict client-side validation to guarantee polls contain at least 2 distinct choices
        const validPollOptions = pollOptions.map((o) => o.trim()).filter((o) => o.length > 0);
        if (postType === "POLL" && validPollOptions.length < 2) {
            setError("🔒 Survey Error: You must fill out at least 2 distinct option choices to create a poll.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), content: postType === "TEXT" ? content.trim() : null, postType, pollOptions: postType === "POLL" ? validPollOptions : [], subredditId, files: postType === "TEXT" ? files : [], tagId: selectedTagId || null }),
            });

            if (!res.ok) {
                const payload = await res.json();
                const { getFriendlyErrorMessage } = await import("@/lib/errors-dictionary");
                setError(getFriendlyErrorMessage(payload.code));
                return;
            }

            localStorage.removeItem(STORAGE_KEY);
            router.refresh();
            router.push(`/r/${subredditName}`);
        } catch (err: unknown) {
            setError("⚠️ Failed to establish a secure uplink to the server network rows.");
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
            {availableTags.length > 0 && (
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 select-none">Select Thread Category Tag</label>
                    <select
                        value={selectedTagId}
                        onChange={(e) => setSelectedTagId(e.target.value)}
                        disabled={isLoading}
                        className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 font-bold focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                        <option value="">-- No Category Tag Attached --</option>
                        {availableTags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                🏷️ {tag.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isLoading} placeholder="Title your post..." className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100 font-bold" />
            </div>

            {postType === "TEXT" ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5 select-none">
                        <label className="block text-xs font-semibold text-gray-400 uppercase">Body Content String Matrix</label>
                        <div className="flex bg-gray-50 dark:bg-gray-950 p-0.5 rounded border border-gray-200 dark:border-gray-800 text-[9px] font-black uppercase tracking-wider">
                            <button type="button" onClick={() => setActiveWriteMode("WRITE")} className={`px-2 py-0.5 rounded transition ${activeWriteMode === "WRITE" ? "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold" : "text-gray-400"}`}>Edit Text</button>
                            <button type="button" onClick={() => setActiveWriteMode("PREVIEW")} className={`px-2 py-0.5 rounded transition ${activeWriteMode === "PREVIEW" ? "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold" : "text-gray-400"}`}>👁 Visual Preview</button>
                        </div>
                    </div>

                    {activeWriteMode === "WRITE" ? (
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={isLoading} placeholder="What are your thoughts? Write content here..." rows={5} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100 resize-none font-sans" />
                    ) : (
                        <div className="w-full min-h-[120px] max-h-[240px] overflow-y-auto px-4 py-3 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg font-sans space-y-1">
                            {renderSimpleMarkdownPreview(content)}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-400 uppercase">Attach Media Files</label>
                        <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={isLoading} className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-700 dark:file:bg-gray-800 dark:file:text-gray-300 cursor-pointer" />
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
                            <input type="text" value={option} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Option choice ${idx + 1}...`} disabled={isLoading} className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 font-semibold" />
                            {pollOptions.length > 2 && <button type="button" onClick={() => setPollOptions((prev) => prev.filter((_, i) => i !== idx))} className="text-xs font-bold text-gray-400 hover:text-red-500 px-1">✕</button>}
                        </div>
                    ))}
                    {pollOptions.length < 6 && <button type="button" onClick={() => setPollOptions((prev) => [...prev, ""])} className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider hover:underline pt-1">+ Add Option Choice</button>}
                </div>
            )}

            {error && <p className="text-xs font-bold text-red-500 animate-shake">{error}</p>}
            <button type="submit" disabled={isLoading || !title.trim()} className="w-full bg-orange-600 hover:bg-orange-500 font-bold text-white rounded-full py-2 text-sm shadow-sm transition disabled:opacity-50">{isLoading ? "Publishing Thread..." : "Submit Post"}</button>
        </form>
    );
}
