import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VoteController } from "../posts/VoteController";
import { MediaCarousel } from "../ui/MediaCarousel";
import { SafeMediaWrapper } from "../ui/SafeMediaWrapper";
import { SubscribeLeaveButton } from "./SubscribeLeaveButton";
import { OnlineCounterWidget } from "./OnlineCounterWidget";
import { MemberFlairSelector } from "./MemberFlairSelector";
import { connection } from "next/server";
import { SubredditMegathreadHub } from "./SubredditMegathreadHub";
import { SubredditWithRelations } from "@/types/db";
import { LiveStreamTheaterCard } from "../streaming/LiveStreamTheaterCard";


interface SubredditViewProps {
    slugPromise: Promise<{ slug: string }>;
}

export async function SubredditView({ slugPromise }: SubredditViewProps) {
    await connection();
    const { slug } = await slugPromise;
    const session = await auth();

    // Unified Query: Pull community details, custom user flairs, subscriber logs, and sorted posts
    const subreddit = await db.subreddit.findUnique({
        where: { name: slug.toLowerCase() },
        include: {
            megathreadLinks: true,
            subscribers: { select: { userId: true, selectedFlair: true } },
            flairs: { select: { text: true, backgroundColor: true, textColor: true, createdAt: true, id: true, subredditId: true } },
            posts: {
                include: {
                    author: true,
                    votes: true,
                    media: true,
                    _count: { select: { comments: true } }
                },
                orderBy: [{ isSticky: "desc" }, { id: "desc" }]
            },
            // INJECTED: Read ongoing broadcast nodes belonging to this specific subreddit canvas
            liveStreams: {
                where: { status: "STREAMING" },
                select: { id: true, title: true, viewerCount: true },
                take: 1 // Load the primary active stream channel if available
            }
        }
    });


    if (!subreddit) notFound();

    const isSubscribed = subreddit.subscribers.some((sub) => sub.userId === session?.user?.id);
    const userSubRow = subreddit.subscribers.find((sub) => sub.userId === session?.user?.id);
    const activeStream = subreddit.liveStreams && subreddit.liveStreams.length > 0 ? subreddit.liveStreams[0] : null;

    return (
        <div className="py-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left Column: Community Banner & Post Feed */}
            <div className="md:col-span-2 space-y-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors">
                    {subreddit.bannerUrl ? (
                        <div className="h-24 w-full relative bg-gray-200 dark:bg-gray-800">
                            <img src={subreddit.bannerUrl} alt={`${subreddit.name} banner`} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="h-4 w-full" style={{ backgroundColor: subreddit.accentColor || "#ea580c" }} />
                    )}
                    <SubredditMegathreadHub links={subreddit.megathreadLinks || []} />
                    {activeStream && (
                        <div className="w-full max-w-2xl mx-auto">
                            <LiveStreamTheaterCard
                                streamId={activeStream.id}
                                title={activeStream.title}
                                initialViewerCount={activeStream.viewerCount}
                            />
                        </div>
                    )}
                    <div className="p-6">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">r/{subreddit.name}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subreddit.description || `Welcome to r/${subreddit.name}!`}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {subreddit.posts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-xl text-center text-gray-400 font-medium italic">No posts submitted to this community yet.</div>
                    ) : (
                        subreddit.posts.map((post) => {
                            const upvotes = post.votes.filter((v) => v.type === "UP").length;
                            const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
                            const currentVoteRecord = post.votes.find((v) => v.userId === session?.user?.id);
                            const urls = post.media.map((m) => m.url);

                            // Trace the specific author's selected community flair badge parameters
                            const activeSubRow = subreddit.subscribers.find((sub) => sub.userId === post.authorId);
                            const matchedFlair = subreddit.flairs.find((f) => f.text === activeSubRow?.selectedFlair);

                            return (
                                <div key={post.id} className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
                                    <VoteController targetId={post.id} targetType="POST" initialScore={upvotes - downvotes} currentVote={currentVoteRecord ? (currentVoteRecord.type as "UP" | "DOWN") : null} hasUser={!!session?.user} />
                                    <div className="p-5 flex-1 space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                            <span>Posted by</span>
                                            <Link href={`/u/${post.author.username}`} className="font-bold text-gray-700 dark:text-gray-300 hover:underline">u/{post.author.username}</Link>
                                            {matchedFlair && (
                                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: matchedFlair.backgroundColor, color: matchedFlair.textColor }}>{matchedFlair.text}</span>
                                            )}
                                            {post.isSticky && <span className="text-green-600 dark:text-green-400 font-extrabold ml-1">📌 Pinned</span>}
                                        </div>
                                        <Link href={`/r/${subreddit.name}/comments/${post.id}`} className="block group"><h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">{post.title}</h2></Link>
                                        {post.content && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.content}</p>}
                                        <SafeMediaWrapper isNSFW={post.isNSFW} isSpoiler={post.isSpoiler}><MediaCarousel mediaUrls={urls} /></SafeMediaWrapper>
                                        <div className="pt-2 flex items-center gap-4"><Link href={`/r/${subreddit.name}/comments/${post.id}`} className="text-xs text-gray-400 font-semibold">💬 {post._count.comments} Comments</Link></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {/* Right Column: About Sidebar Details Widget Pane */}
            <div className="hidden md:block">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-4 sticky top-20 transition-colors duration-200">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">About Community</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">{subreddit.description || "No description provided."}</p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                        <OnlineCounterWidget subredditName={subreddit.name} />
                    </div>

                    {session?.user && (
                        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
                            <Link href={`/r/${subreddit.name}/submit`} className="w-full block text-center bg-orange-600 hover:bg-orange-500 text-white rounded-full py-1.5 text-xs font-bold transition-all shadow-sm">Create Post</Link>
                            <SubscribeLeaveButton subredditId={subreddit.id} isSubscribed={isSubscribed} />

                            {/* Embedded: Interactive Client User Flair Selector Dropdown for Subscribers */}
                            {isSubscribed && (
                                <MemberFlairSelector subredditId={subreddit.id} availableFlairs={subreddit.flairs} currentFlair={userSubRow?.selectedFlair || ""} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}