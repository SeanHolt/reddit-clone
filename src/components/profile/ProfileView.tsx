import { db } from "@/lib/db";
import { auth } from "@/auth"; // Import the auth layer explicitly
import { notFound } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";

interface ProfileViewProps {
    paramsPromise: Promise<{ username: string }>;
}

export async function ProfileView({ paramsPromise }: ProfileViewProps) {
    await connection();
    const { username } = await paramsPromise;
    const session = await auth(); // Active Session Verification Check

    const user = await db.user.findUnique({
        where: { username },
        include: {
            posts: {
                include: { subreddit: true, votes: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!user) {
        notFound();
    }

    const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
    });

    // Authorization Check: Don't show the messaging button to the user viewing their own profile
    const isOwnProfile = session?.user?.id === user.id;

    return (
        <div className="py-6 max-w-4xl mx-auto space-y-6">
            {/* Upper avatar banner header sections code blocks remain identical */}
            <div className="h-32 w-full rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 shadow-sm relative">
                <div className="absolute -bottom-10 left-6 flex items-end justify-between w-[92%]">
                    <div className="flex items-end gap-4">
                        {/* Avatar image render card blocks remain identical */}
                        <div className="mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                {user.displayName || `u/${user.username}`}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">u/{user.username}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                {/* Left Side: Authored Posts grid list wrapper view maps here identically */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">Submitted Posts</h2>
                    {user.posts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-400 font-medium shadow-sm rounded-xl">This user hasn&apos;t submitted any posts yet.</div>
                    ) : (
                        user.posts.map((post) => {
                            const upvotes = post.votes.filter((v) => v.type === "UP").length;
                            const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
                            return (
                                <div key={post.id} className="bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all space-y-1">
                                    <p className="text-xs text-gray-400"><Link href={`/r/${post.subreddit.name}`} className="font-bold text-gray-700 dark:text-gray-300 hover:underline">r/{post.subreddit.name}</Link> • Score: {upvotes - downvotes}</p>
                                    <Link href={`/r/${post.subreddit.name}/comments/${post.id}`} className="block group"><h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">{post.title}</h3></Link>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right Side: Sidebar Dashboard Information Card Layout */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">About u/{user.username}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed wrap-break-word">{user.bio || "This user hasn't written a bio yet."}</p>

                        {/* Phase 5 Action: Add conditional Message User Navigation Link */}
                        {session?.user && !isOwnProfile && (
                            <div className="pt-1">
                                <Link
                                    href={`/messages/${user.id}`}
                                    className="w-full block text-center bg-orange-600 hover:bg-orange-500 text-white rounded-full py-2 text-xs font-bold transition-all shadow-sm"
                                >
                                    💬 Message User
                                </Link>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
                            <div><p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.postKarma}</p><p className="text-[10px] text-gray-400 uppercase font-semibold">Post Karma</p></div>
                            <div><p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.commentKarma}</p><p className="text-[10px] text-gray-400 uppercase font-semibold">Comment Karma</p></div>
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-50 dark:border-gray-800">Cake Day: {joinDate}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
