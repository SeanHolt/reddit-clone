import { db } from "@/lib/db";
import { connection } from "next/server"; // Import Next.js 16 connection utility

interface OnlineCounterWidgetProps {
  subredditName: string;
}

export async function OnlineCounterWidget({ subredditName }: OnlineCounterWidgetProps) {
  // 1. Enforce dynamic request-bound execution safely, isolating the impure Date constructor
  await connection();

  // Define our 15-minute rolling expiration filter threshold calculation
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  // 2. Query SQLite to aggregate unique users active in this community within the window
  const activeCount = await db.user.count({
    where: {
      activeSubredditName: subredditName,
      lastActiveAt: {
        gte: fifteenMinutesAgo,
      },
    },
  });

  // Ensure we always render a baseline minimum score of at least 1 online user
  const displayCount = Math.max(1, activeCount);

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 select-none">
      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span>{displayCount} {displayCount === 1 ? "member online now" : "members online now"}</span>
    </div>
  );
}