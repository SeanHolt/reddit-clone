import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { VoteController } from "./VoteController";
import { CommentSection } from "../comments/CommentSection";
import { CommentTreeExtended } from "../comments/CommentNode";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { MediaCarousel } from "../ui/MediaCarousel"; // Import carousel element
import { SafeMediaWrapper } from "../ui/SafeMediaWrapper";
import { connection } from "next/server";
import { PostViewTracker } from "./PostViewTracker";

interface SinglePostViewProps {
    paramsPromise: Promise<{ slug: string; postId: string }>;
}

export async function SinglePostView({ paramsPromise }: SinglePostViewProps) {
    await connection();
    const { postId } = await paramsPromise;
    const session = await auth();

    const post = await db.post.findUnique({
        where: { id: postId },
        include: {
            author: true,
            subreddit: true,
            votes: true,
            media: true,
            _count: { select: { comments: true, views: true } }, // Aggregate view model count row fields
            comments: { include: { author: true, votes: true }, orderBy: { createdAt: "asc" } },
        },
    });

    if (!post) notFound();

    const upvotes = post.votes.filter((v) => v.type === "UP").length;
    const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
    const currentVoteRecord = post.votes.find((v) => v.userId === session?.user?.id);
    const urls = post.media.map((m) => m.url); // Extract string arrays cleanly

    const buildCommentTree = (parentId: string | null): CommentTreeExtended[] => {
        return post.comments
            .filter((c) => c.parentId === parentId)
            .map((c) => ({
                id: c.id,
                text: c.text,
                createdAt: c.createdAt.toISOString(),
                author: { username: c.author.username, image: c.author.image, displayName: c.author.displayName },
                votes: c.votes,
                replies: buildCommentTree(c.id),
                postId: c.postId,
                parentId: c.parentId,
            }));
    };

    const nestedComments = buildCommentTree(null);

    return (
        <div className="py-6 max-w-3xl mx-auto space-y-6">
            <PostViewTracker postId={post.id} />
            <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
                <VoteController
                    targetId={post.id}
                    targetType="POST"
                    initialScore={upvotes - downvotes}
                    currentVote={currentVoteRecord ? (currentVoteRecord.type as "UP" | "DOWN") : null}
                    hasUser={!!session?.user}
                />
                <div className="p-5 flex-1 space-y-2">
                    <p className="text-xs text-gray-400">
                        Posted by u/{post.author.username || "anonymous"} • {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                    <div className="pt-3 flex items-center gap-3 text-xs font-semibold text-gray-400 select-none">
                        <span className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-md">
                            💬 {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
                        </span>
                        {/* Dynamic Real-Time Impression Count Metric Viewer Badge */}
                        <span className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                            👁️ {post._count.views} {post._count.views === 1 ? "View" : "Views"}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{post.title}</h1>
                    {post.content && (
                        <div className="mt-2 pt-1 border-t border-gray-50 dark:border-gray-800">
                            <MarkdownRenderer content={post.content} />
                        </div>
                    )}

                    {/* Display the multi-media slider layout element wide on the dedicated page */}
                    <SafeMediaWrapper isNSFW={post.isNSFW} isSpoiler={post.isSpoiler}>
                        <MediaCarousel mediaUrls={urls} />
                    </SafeMediaWrapper>

                    <div className="pt-3 flex items-center text-xs font-semibold text-gray-400 select-none">
                        <span className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-md">
                            💬 {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
                        </span>
                    </div>
                </div>
            </div>
            <CommentSection comments={nestedComments} postId={post.id} currentUserId={session?.user?.id} />
        </div>
    );
}
