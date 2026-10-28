import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { computeProfileRibbons } from "@/lib/achievements";
import { ProfileRibbonList } from "./ProfileRibbonList";
import { MessageUserButton } from "./MessageUserButton";

interface ProfileViewProps {
  paramsPromise: Promise<{ username: string }>;
}

export async function ProfileView({ paramsPromise }: ProfileViewProps) {
    const { username } = await paramsPromise;
  const session = await auth();

  // 1. Fetch targeted profile metadata record and inverse community subscription totals
  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      _count: { select: { posts: true, subscriptions: true } }
    }
  });

  if (!user) notFound();

  // 2. Compute the gamified ribbon collections from indexed scalar columns
  const totalKarma = (user.postKarma || 0) + (user.commentKarma || 0);
  const earnedRibbons = computeProfileRibbons({
    postKarma: user.postKarma || 0,
    commentKarma: user.commentKarma || 0,
    createdAt: user.createdAt,
  });
  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6 px-4 animate-fadeIn">
      {/* Visual Cover Banner Header Layer */}
      <div className="h-32 w-full rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 shadow-sm relative">
        <div className="absolute -bottom-10 left-6 flex items-end justify-between w-[92%]">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 overflow-hidden shadow-sm flex-shrink-0">
              {user.image ? <img src={user.image} alt="User Avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600">u</div>}
            </div>
            <div className="mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {user.displayName || `u/${user.username}`}
              </h1>
              <p className="text-sm text-gray-500 font-medium">u/{user.username}</p>
            </div>
          </div>
          <div className="mb-1 hidden sm:block">
            <MessageUserButton targetUserId={user.id} targetUsername={user.username || ""} currentUserId={session?.user?.id || null} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        {/* Left main content segment (can render past submissions stream arrays later) */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-xs text-gray-400 font-medium italic select-none">
            📚 Threads authored by u/{user.username} are indexed under historical dashboard logs.
          </div>
        </div>

        {/* Right Info Sidebar Pane Dashboard */}
        <div className="space-y-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm h-fit transition-colors">
          <h2 className="text-xs font-black uppercase text-gray-400 tracking-wider">User Information</h2>
          <div className="space-y-2 border-b border-gray-100 dark:border-gray-800 pb-3 font-mono font-bold text-xs text-gray-700 dark:text-gray-300 select-none">
            <div className="flex justify-between"><span>Post Karma</span><span className="text-orange-600 font-black">{user.postKarma || 0}</span></div>
            <div className="flex justify-between"><span>Comment Karma</span><span className="text-orange-600 font-black">{user.commentKarma || 0}</span></div>
            <div className="flex justify-between border-t border-gray-50 dark:border-gray-950 pt-1.5 text-gray-900 dark:text-gray-100"><span>Total Score</span><span>{totalKarma}</span></div>
          </div>

          {/* INJECTED: Expose the high-fidelity achievement ribbons list container directly inside the sidebar column space */}
          <ProfileRibbonList ribbons={earnedRibbons} />
        </div>
      </div>
    </div>
  );
}
