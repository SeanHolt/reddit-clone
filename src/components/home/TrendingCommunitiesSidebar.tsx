import { db } from "@/lib/db";
import Link from "next/link";
import { connection } from "next/server";

interface MappedTrendingItem {
    id: string;
    name: string;
    description: string | null;
    accentColor: string | null;
    newCount: number;
}

export async function TrendingCommunitiesSidebar() {
    await connection();
    const pastDayWindow = new Date();
    pastDayWindow.setHours(pastDayWindow.getHours() - 24);

    // 1. Fixed: Use a standard .findMany query to isolate recent subscription rows safely
    const recentSubscriptions = await db.subscription.findMany({
        where: { createdAt: { gte: pastDayWindow } },
        select: { subredditId: true },
    });
    console.log("Recent subscriptions in the past 24 hours:", recentSubscriptions.length);
    if (recentSubscriptions.length === 0) return null;

    // 2. Compute counts and aggregates in memory to bypass group-by compiler limitations
    const countMap = recentSubscriptions.reduce((acc: Record<string, number>, curr) => {
        acc[curr.subredditId] = (acc[curr.subredditId] || 0) + 1;
        return acc;
    }, {});

    // Extract the top 5 fastest-growing subreddit ID handles sorted by count velocity
    const topSubIds = Object.keys(countMap)
        .sort((a, b) => countMap[b] - countMap[a])
        .slice(0, 5);

    // 3. Hydrate the core metadata parameters for our trending subreddit rows
    const subreddits = await db.subreddit.findMany({
        where: { id: { in: topSubIds } },
        select: { id: true, name: true, description: true, accentColor: true },
    });

    const processedList: MappedTrendingItem[] = subreddits.map((sub) => ({
        ...sub,
        newCount: countMap[sub.id] || 0,
    })).sort((a, b) => b.newCount - a.newCount);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors duration-200">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 select-none">
                <span>⚡ Trending Communities</span>
            </div>

            <div className="space-y-2.5 divide-y divide-gray-50 dark:divide-gray-800/40">
                {processedList.map((sub, index) => (
                    <div key={sub.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs font-semibold">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono font-black text-gray-400 w-4 text-center">#{index + 1}</span>
                            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: sub.accentColor || "#ea580c" }} />
                            <div className="min-w-0 flex-1">
                                <Link href={`/r/${sub.name}`} className="block text-gray-800 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:underline font-bold truncate">
                                    r/{sub.name}
                                </Link>
                                {sub.description && <p className="text-[10px] text-gray-400 font-medium truncate leading-tight mt-0.5">{sub.description}</p>}
                            </div>
                        </div>

                        <span className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-black text-[10px] px-2 py-0.5 rounded-full select-none flex-shrink-0">
                            +{sub.newCount} new
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
