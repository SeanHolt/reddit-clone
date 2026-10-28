"use client";

import { useEffect, useState, useRef } from "react";

interface EquippedAsset {
    isEquipped: boolean;
    item: { assetType: string; styleValue: string };
}

interface CommentItem {
    id: string;
    text: string;
    createdAt: string | Date;
    author: {
        username: string | null;
        image: string | null;
        inventory?: EquippedAsset[]; // Added equipped assets reference array row
    };
}

interface PaginatedCommentListProps {
    postId: string;
    initialComments: CommentItem[];
    initialCursor: string | null;
}

export function PaginatedCommentList({ postId, initialComments, initialCursor }: PaginatedCommentListProps) {
    const [comments, setComments] = useState<CommentItem[]>(initialComments);
    const [cursor, setCursor] = useState<string | null>(initialCursor);
    const [isLoading, setIsLoading] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && cursor && !isLoading) {
                    setIsLoading(true);
                    try {
                        const res = await fetch(`/api/comments/pagination?postId=${postId}&cursor=${cursor}`);
                        if (res.ok) {
                            const body = await res.json();
                            setComments((prev) => [...prev, ...body.items]);
                            setCursor(body.nextCursor);
                        }
                    } catch (err) {
                        console.error("COMMENT_PAGINATION_FAULT:", err);
                    } finally {
                        setIsLoading(false);
                    }
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );

        const currentTrigger = triggerRef.current;
        if (currentTrigger) observer.observe(currentTrigger);
        return () => { if (currentTrigger) observer.unobserve(currentTrigger); };
    }, [cursor, postId, isLoading]);

    return (
        <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <div className="space-y-3.5 divide-y divide-gray-50 dark:divide-gray-800/40">
                {comments.map((comment) => {
                    // 1. Scan user records to isolate custom border glow definitions
                    const equippedStyles = comment.author.inventory || [];
                    const borderGlow = equippedStyles.find(a => a.item.assetType === "BORDER_GLOW")?.item.styleValue || "";
                    const fontStyle = equippedStyles.find(a => a.item.assetType === "FONT_STYLE")?.item.styleValue || "";

                    return (
                        <div
                            key={comment.id}
                            className={`pt-3.5 first:pt-0 pb-3 px-3 space-y-1.5 transition-all duration-200 border rounded-xl bg-transparent border-transparent ${borderGlow}`}
                        >
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 select-none">
                                <span className="font-bold text-gray-700 dark:text-gray-300">u/{comment.author.username || "anonymous"}</span>
                                <span>•</span>
                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            {/* Inject custom font scripts, sizes, or weight class weights directly onto body texts */}
                            <p className={`text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans ${fontStyle}`}>
                                {comment.text}
                            </p>
                        </div>
                    );
                })}
            </div>

            {cursor && (
                <div ref={triggerRef} className="h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 select-none">
                    {isLoading ? "🔄 Fetching more responses..." : "↕ Scroll down to stream context"}
                </div>
            )}
        </div>
    );
}
