import { auth } from "@/auth";
import Link from "next/link";
import { VoteController } from "../posts/VoteController";
import { PostWithRelations } from "@/types/db"; // Clean centralized type import

export const instantiate = true; // Ensure this component is rendered on the client side

interface PostSearchResultsProps {
  searchParamsPromise: Promise<{ q?: string }>;
}

export async function PostSearchResults({ searchParamsPromise }: PostSearchResultsProps) {
  const session = await auth();
  const { q } = await searchParamsPromise;
  const queryText = q?.trim() || "";

  if (!queryText) return <div className="text-sm text-gray-400 text-center py-6">Provide a keyword search query above to browse topics.</div>;

  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/search/posts?q=${encodeURIComponent(queryText)}`, { cache: "no-store" });
  if (!res.ok) return <div className="text-sm text-red-500 text-center py-6">Error retrieving discovery feed data.</div>;
  
  const posts = (await res.json()) as PostWithRelations[];
  if (posts.length === 0) return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-xl text-center text-gray-400 font-medium shadow-sm">No post headers or content matched your search.</div>;

  // 1. Safe Token Highlighting Utility Function
  const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    const escapedSearch = search.replace(/[-\/\\^\$*+?.()|[\]{}]/g, "\\$&"); // Prevent regular expression boundary crashes
    const regex = new RegExp(`(${escapedSearch})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold px-0.5 rounded">{part}</mark> 
        : part
    );
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const upvotes = post.votes.filter((v) => v.type === "UP").length;
        const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
        const currentVoteRecord = post.votes.find((v) => v.userId === session?.user?.id);

        return (
          <div key={post.id} className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <VoteController targetId={post.id} targetType="POST" initialScore={upvotes - downvotes} currentVote={currentVoteRecord ? (currentVoteRecord.type as "UP" | "DOWN") : null} hasUser={!!session?.user} />
            <div className="p-5 flex-1 space-y-1">
              <p className="text-xs text-gray-400">
                <Link href={`/r/${post.subreddit.name}`} className="font-bold text-gray-700 dark:text-gray-300 hover:underline">r/{post.subreddit.name}</Link>
                • Posted by u/{post.author.username || "anonymous"}
              </p>
              <Link href={`/r/${post.subreddit.name}/comments/${post.id}`} className="block group">
                {/* 2. Apply Text Highlighting to Title */}
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">
                  {highlightMatch(post.title, queryText)}
                </h2>
              </Link>
              {/* 3. Apply Text Highlighting to Content Body */}
              {post.content && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{highlightMatch(post.content, queryText)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
