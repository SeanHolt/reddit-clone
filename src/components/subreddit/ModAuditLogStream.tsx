import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export async function ModAuditLogStream() {
    await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 1. Gather all subreddits this specific user created and owns
  const ownedSubreddits = await db.subreddit.findMany({
    where: { creatorId: session.user.id },
    select: { id: true, name: true },
  });
  const ownedIds = ownedSubreddits.map((s) => s.id);

  // 2. Fetch the historical moderation actions applied to those spaces
  const logs = await db.moderationAction.findMany({
    where: { subredditId: { in: ownedIds } },
    include: { user: true, subreddit: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (logs.length === 0) {
    return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-gray-400 text-xs font-semibold">Your moderation audit log history is completely empty.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-black text-xs text-gray-400 uppercase tracking-wider">Moderation System Audit Timeline Log</div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
        {logs.map((log) => {
          const isBan = log.type === "BAN";
          return (
            <div key={log.id} className="px-4 py-3 flex items-center justify-between text-xs font-medium">
              <div className="space-y-0.5 flex-1">
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="font-bold text-orange-600">r/{log.subreddit.name}</span> • Enforced <strong className="text-gray-900 dark:text-white">u/{log.user.username}</strong> restriction.
                </p>
                {log.reason && <p className="text-gray-400 dark:text-gray-500 italic">Context: `{log.reason}`</p>}
                <p className="text-[10px] text-gray-400 font-normal">{new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}</p>
              </div>
              <span className={`font-black text-[10px] uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                isBan 
                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30" 
                  : "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30"
              }`}>
                {isBan ? "🚫 Permanent Ban" : "⏱️ Timeout"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}