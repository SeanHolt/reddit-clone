import { auth } from "@/auth";
import { InfiniteScrollStream } from "../ui/InfiniteScrollStream";
import { FeedSortTabs } from "./FeedSortTabs";
import { connection } from "next/server";

interface HomeFeedProps {
    searchParamsPromise: Promise<{ feed?: string }>;
}

export async function HomeFeed({ searchParamsPromise }: HomeFeedProps) {
    await connection();
    const session = await auth();
    const { feed } = await searchParamsPromise;
    const activeFeed = feed || "popular";

    // Server-side baseline prefetch fetch from our internal feed API endpoint
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/posts/feed?limit=10&feed=${activeFeed}`, {
        cache: "no-store",
        headers: session?.user ? { Cookie: `next-auth.session-token=${session.user.id}` } : undefined, // Proxy auth if necessary
    });

    const data = await res.json();
    const items = data.items || [];

    return (
        <div className="space-y-4">
            {/* Dynamic Dual-Tab Toggle Controls Element */}
            <FeedSortTabs />

            {activeFeed === "home" && items.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-xl text-center text-gray-400 font-medium italic shadow-sm">
                    Your Home feed is clear! You aren&apos;t subscribed to any communities yet, or your followed spaces haven&apos;t posted. Flip over to Popular to discover trends!
                </div>
            ) : (
                <InfiniteScrollStream
                    initialPosts={items}
                    initialCursor={data.nextCursor}
                    currentUserId={session?.user?.id}
                    sort={activeFeed === "popular" ? "hot" : "new"}
                />
            )}
        </div>
    );
}
