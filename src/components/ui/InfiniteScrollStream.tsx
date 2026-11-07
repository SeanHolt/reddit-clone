"use client";

import { useEffect, useState, useRef } from "react";
import { PostWithRelations } from "@/types/db";
import { VoteController } from "../posts/VoteController";
import { AwardBadgeList } from "../posts/AwardBadgeList";
import { PollCardController } from "../posts/PollCardController";
import { parseInlineCustomEmojis } from "@/lib/emoji-parser";
import Link from "next/link";
import { MediaCarousel } from "./MediaCarousel";

interface InfiniteScrollStreamProps {
    initialPosts: PostWithRelations[];
    initialNextCursor: string | null;
    currentUserId: string | null | undefined;
    feedType: string;
    subredditId?: string;
}

export function InfiniteScrollStream({ initialPosts, initialNextCursor, currentUserId, feedType, subredditId }: InfiniteScrollStreamProps) {
    const [posts, setPosts] = useState<PostWithRelations[]>(initialPosts);
    const [cursor, setCursor] = useState<string | null>(initialNextCursor);
    const [isLoading, setIsLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            async (entries) => {
                // FIXED: Extract the first entry item token node out of the entries array row cleanly
                const entry = entries[0];

                if (entry && entry.isIntersecting && cursor && !isLoading) {
                    setIsLoading(true);
                    try {
                        const url = `/api/posts/feed?feed=${feedType}&cursor=${cursor}${subredditId ? `&subredditId=${subredditId}` : ""}`;
                        const res = await fetch(url);
                        if (res.ok) {
                            const data = await res.json();
                            setPosts((prev) => [...prev, ...data.items]);
                            setCursor(data.nextCursor);
                        }
                    } catch (err) {
                        console.error("FEED_PAGINATION_STREAM_CRASH:", err);
                    } finally {
                        setIsLoading(false);
                    }
                }
            },
            { threshold: 0.1, rootMargin: "150px" }
        );

        const currentElement = observerRef.current;
        if (currentElement) observer.observe(currentElement);
        return () => { if (currentElement) observer.unobserve(currentElement); };
    }, [cursor, isLoading, feedType, subredditId]);
    return (
        <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <div className="space-y-4">
                {posts.map((post) => {
                    const subredditEmojis = post.subreddit?.customEmojis || [];
                    const upvotes = post.votes?.filter((v) => v.type === "UP").length || 0;
                    const downvotes = post.votes?.filter((v) => v.type === "DOWN").length || 0;
                    const userVoteRecord = post.votes?.find((v) => v.userId === currentUserId);

                    const userProgress = post.author?.subredditProgress || [];
                    const activeProgress = userProgress.find((p) => p.subredditId === post.subredditId);
                    const currentLevel = activeProgress ? activeProgress.level : 1;

                    return (
                        <div key={post.id} className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xs overflow-hidden transition-colors duration-200 animate-fadeIn">
                            {/* Left Column: Core Side Vote Controller Bar */}
                            <VoteController
                                targetId={post.id}
                                targetType="POST"
                                initialScore={upvotes - downvotes}
                                currentVote={userVoteRecord ? (userVoteRecord.type as "UP" | "DOWN") : null}
                                hasUser={!!currentUserId}
                            />

                            {/* Right Column: Dynamic Post Presentation Content */}
                            <div className="p-4 flex-1 space-y-2.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 font-semibold select-none">
                                    <Link href={`/r/${post.subreddit.name}`} className="font-black text-gray-700 dark:text-gray-300 hover:underline">
                                        r/{post.subreddit.name}
                                    </Link>
                                    <span>•</span>
                                    <span>Posted by</span>
                                    <Link href={`/u/${post.author?.username || "anonymous"}`} className="font-bold text-gray-500 hover:underline">
                                        u/{post.author?.username || "anonymous"}
                                    </Link>
                                    <span className="px-1.5 py-0.5 ml-0.5 rounded bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400 text-[9px] font-black uppercase tracking-wider border border-orange-500/10">
                                        Lvl {currentLevel}
                                    </span>
                                </div>

                                <Link href={`/r/${post.subreddit.name}/comments/${post.id}`} className="block group">
                                    <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors leading-snug">
                                        {parseInlineCustomEmojis(post.title, subredditEmojis)}
                                    </h2>
                                </Link>
                                {post.content && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-3 leading-relaxed font-sans">{post.content}</p>}

                                {/* Media Presentation: Multi-Image Carousel Slider Layer */}
                                {post.media && post.media.length > 0 && (
                                    <div className="pt-1 max-w-xl">
                                        <MediaCarousel
                                            mediaUrls={post.media.map((item) => item.url)}
                                        />
                                    </div>
                                )}

                                {/* Survey Elements: Dynamic Interactive Poll Container */}
                                {post.pollOptions && post.pollOptions.length > 0 && (
                                    <div className="pt-1">
                                        <PollCardController postId={post.id} pollOptions={post.pollOptions} currentUserId={currentUserId} />
                                    </div>
                                )}

                                {/* Social Badging Drawer Layer Container */}
                                <div className="pt-1.5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between gap-4">
                                    <AwardBadgeList postId={post.id} initialAwards={post.postAwards || []} hasUser={!!currentUserId} />
                                    <Link href={`/r/${post.subreddit.name}/comments/${post.id}`} className="text-[11px] text-gray-400 font-bold hover:underline shrink-0">
                                        💬 {post._count?.comments || 0} Comments
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {cursor && (
                <div ref={observerRef} className="h-12 flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 select-none">
                    {isLoading ? "🔄 Loading next page loop threads..." : "↕ Keep scrolling to discover content"}
                </div>
            )}
        </div>
    );
}