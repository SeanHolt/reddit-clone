"use client";

import { useState, useEffect } from "react";
import { VoteController } from "../posts/VoteController";
import { MediaCarousel } from "./MediaCarousel";
import { SafeMediaWrapper } from "./SafeMediaWrapper";
import { ReportButton } from "./ReportButton";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { PostWithRelations } from "@/types/db";
import Link from "next/link";

interface InfiniteScrollStreamProps {
  initialPosts: PostWithRelations[];
  initialCursor: string | null;
  subredditId?: string;
  currentUserId?: string | null;
  sort?: string;
}

export function InfiniteScrollStream({ initialPosts, initialCursor, subredditId, currentUserId, sort }: InfiniteScrollStreamProps) {
  const [posts, setPosts] = useState<PostWithRelations[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const { elementRef, isIntersecting } = useIntersectionObserver();

  useEffect(() => {
    if (!isIntersecting || !nextCursor || isLoading) return;

    const fetchNextPage = async () => {
      setIsLoading(true);
      try {
        let url = `/api/posts/feed?cursor=${nextCursor}&sort=${sort || "hot"}`;
        if (subredditId) url += `&subredditId=${subredditId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load stream increment.");
        
        const data = await res.json();
        setPosts((prev) => [...prev, ...(data.items as PostWithRelations[])]);
        setNextCursor(data.nextCursor);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNextPage();
  }, [isIntersecting, nextCursor, isLoading, subredditId, sort]);

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const upvotes = post.votes.filter((v) => v.type === "UP").length;
        const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
        const currentVoteRecord = post.votes.find((v) => v.userId === currentUserId);
        const urls = post.media.map((m) => m.url);

        return (
          <div key={post.id} className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <VoteController targetId={post.id} targetType="POST" initialScore={upvotes - downvotes} currentVote={currentVoteRecord ? (currentVoteRecord.type as "UP" | "DOWN") : null} hasUser={!!currentUserId} />
            <div className="p-5 flex-1 space-y-1">
              <p className="text-xs text-gray-400">
                <Link href={`/r/${post.subreddit.name}`} className="font-bold text-gray-700 dark:text-gray-300 hover:underline">r/{post.subreddit.name}</Link>
                {post.isSticky && <span className="ml-2 text-green-600 dark:text-green-400 font-extrabold">📌 Pinned</span>}
              </p>
              <Link href={`/r/${post.subreddit.name}/comments/${post.id}`} className="block group">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">{post.title}</h2>
              </Link>
              {post.content && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.content}</p>}
              <SafeMediaWrapper isNSFW={post.isNSFW} isSpoiler={post.isSpoiler}>
                <MediaCarousel mediaUrls={urls} />
              </SafeMediaWrapper>
              <div className="pt-2 flex items-center gap-4">
                <Link href={`/r/${post.subreddit.name}/comments/${post.id}`} className="text-xs text-gray-400 font-medium">
                  💬 {post._count?.comments || 0} Comments
                </Link>
                <ReportButton targetId={post.id} targetType="POST" hasUser={!!currentUserId} />
              </div>
            </div>
          </div>
        );
      })}
      {nextCursor && <div ref={elementRef} className="h-12 flex items-center justify-center text-xs text-gray-400 font-bold animate-pulse">⏳ Loading...</div>}
    </div>
  );
}
