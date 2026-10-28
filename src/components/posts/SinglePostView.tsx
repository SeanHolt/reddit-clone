import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { parseInlineCustomEmojis } from "@/lib/emoji-parser";
import { PollCardController } from "./PollCardController";
import { PaginatedCommentList } from "./PaginatedCommentList";

interface SinglePostViewProps {
    postId: string;
}

export async function SinglePostView({ postId }: SinglePostViewProps) {
    const session = await auth();

    // 1. Unified Post Query: Fetch initial data, nested community emojis, poll elements, and 15 paginated comments
    const post = await db.post.findUnique({
        where: { id: postId },
        include: {
            author: true,
            subreddit: {
                include: {
                    customEmojis: { select: { shortcode: true, base64Data: true } }
                }
            },
            votes: true,
            media: true,
            _count: { select: { comments: true, views: true } },
            pollOptions: {
                include: {
                    votes: { select: { userId: true } }
                }
            },
            comments: {
                take: 15,
                where: {
                    author: {
                        OR: [
                            { isShadowBanned: false },
                            ...(session?.user?.id ? [{ id: session.user.id }] : [])
                        ]
                    }
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            image: true,
                            // INJECTED: Hydrate active cosmetics on server prefetch loads
                            inventory: {
                                where: { isEquipped: true },
                                include: { item: { select: { assetType: true, styleValue: true } } }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!post) notFound();

    const isAuthor = session?.user?.id === post.authorId;
    const initialCommentsCursor = post.comments.length === 15 ? post.comments[post.comments.length - 1].id : null;
    const subredditEmojis = post.subreddit.customEmojis || [];
    return (
        <div className="py-6 max-w-3xl mx-auto space-y-6 px-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row transition-colors duration-200">
                <div className="p-5 flex-1 space-y-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        r/{post.subreddit.name} • Posted by u/{post.author?.username || "anonymous"}
                    </p>

                    <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                        {parseInlineCustomEmojis(post.title, subredditEmojis)}
                    </h1>

                    {post.content && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-sans font-medium">
                            {post.content}
                        </p>
                    )}

                    {/* Type-Safe Condition: Mount Poll Options Choices dynamically inside SinglePostView detail layers */}
                    {post.pollOptions && post.pollOptions.length > 0 && (
                        <div className="pt-2">
                            <PollCardController
                                postId={post.id}
                                pollOptions={post.pollOptions}
                                currentUserId={session?.user?.id || null}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Discussion Threads Container Grid Box */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider select-none">Discussion Threads</h3>

                {/* MOUNTED: Interactive cursor paginated loading loop container component */}
                <PaginatedCommentList
                    postId={post.id}
                    initialComments={post.comments}
                    initialCursor={initialCommentsCursor}
                />
            </div>
        </div>
    );
}
