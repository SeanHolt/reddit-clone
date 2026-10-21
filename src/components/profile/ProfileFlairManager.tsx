import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MemberFlairSelector } from "../subreddit/MemberFlairSelector";
import { UserFlair } from "@prisma/client"; // Fixed: Pull the true database model type natively

export async function ProfileFlairManager() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscriptions = await db.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      subreddit: {
        include: { flairs: true }
      }
    }
  });

  if (subscriptions.length === 0) {
    return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-gray-400 text-xs font-semibold">Join subreddits to configure flairs.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden select-none transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-black text-xs text-gray-400 uppercase tracking-wider">Community Flairs Hub</div>
      <div className="p-4 space-y-4 divide-y divide-gray-100 dark:divide-gray-800/60">
        {subscriptions.map((sub) => {
          // Fixed: Cast the flairs loop array straight to the official database model type array contract
          const flairs = (sub.subreddit.flairs || []) as UserFlair[];
          const hasFlairs = flairs.length > 0;
          return (
            <div key={sub.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">r/{sub.subreddit.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{hasFlairs ? "Customize your text badge layout." : "No custom flairs configured."}</p>
              </div>
              {hasFlairs && (
                <div className="w-full sm:w-48">
                  <MemberFlairSelector subredditId={sub.subredditId} availableFlairs={flairs} currentFlair={sub.selectedFlair || ""} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
