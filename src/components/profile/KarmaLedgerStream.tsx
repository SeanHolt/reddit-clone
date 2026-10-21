import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function KarmaLedgerStream() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const logs = await db.karmaLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  if (logs.length === 0) {
    return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-gray-400 text-xs font-semibold">Your ledger log is completely clear! Submit posts to earn upvotes.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden select-none transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-black text-xs text-gray-400 uppercase tracking-wider">Karma Points Ledger Timeline</div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
        {logs.map((log) => {
          const isPositive = log.points > 0;
          return (
            <div key={log.id} className="px-4 py-3 flex items-center justify-between text-xs font-medium">
              <div className="space-y-0.5">
                <p className="text-gray-800 dark:text-gray-200">{log.reason}</p>
                <p className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`font-black text-sm px-2.5 py-0.5 rounded-full ${
                isPositive 
                  ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                  : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
              }`}>
                {isPositive ? `+${log.points}` : log.points}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}