import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { VoteController } from "../posts/VoteController";

export async function SavedPostsStream() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const savedEntries = await db.savedPost.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        include: { author: true, subreddit: true, votes: true, _count: { select: { comments: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  if (savedEntries.length === 0) {
    return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-400 font-medium italic shadow-sm">Your bookmark vault is empty. Save interesting posts across feeds to collect them here!</div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {savedEntries.map(({ post }) => {
        const upvotes = post.votes.filter((v) => v.type === "UP").length;
        const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
        const userVote = post.votes.find((v) => v.userId === session.user.id);

        return (
          <div key={post.id} className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
            <VoteController targetId={post.id} targetType="POST" initialScore={upvotes - downvotes} currentVote={userVote ? (userVote.type as "UP" | "DOWN") : null} hasUser={true} />
            <div className="p-5 flex-1 space-y-1">
              <p className="text-xs text-gray-400">
                <Link href={`/r/${post.subreddit.name}`} className="font-bold text-gray-700 dark:text-gray-300 hover:underline">r/{post.subreddit.name}</Link>
                • Posted by u/{post.author.username}
              </p>
              <Link href={`/r/${post.subreddit.name}/comments/${post.id}`} className="block group">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">{post.title}</h2>
              </Link>
              {post.content && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.content}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
