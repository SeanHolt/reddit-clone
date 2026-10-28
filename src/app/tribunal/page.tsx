import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TribunalVoteCard } from "@/components/subreddit/TribunalVoteCard";

// Inform Next.js 16 to treat this parameter-dependent page as a dynamic server route
export const instant = false;

export default async function TribunalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // 1. Jury Eligibility Gate: Verify user holds a high-karma profile rank
  const totalKarma = (session.user.postKarma || 0) + (session.user.commentKarma || 0);
  if (totalKarma < 500) {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-2 px-4 animate-fadeIn">
        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">📋 Tribunal Access Restricted</h2>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
          You need at least <span className="text-orange-600 font-mono font-black">500 total karma</span> to serve as a peer juror on dispute tribunals. Continue contributing high-quality content across feeds to unlock civic duties!
        </p>
      </div>
    );
  }

  // 2. Query pending cases where the user is neither the appellant nor has voted historically
  const openCases = await db.appealCase.findMany({
    where: {
      status: "PENDING",
      userId: { not: session.user.id },
      votes: { none: { jurorId: session.user.id } },
    },
    include: {
      subreddit: { select: { name: true } },
      user: { select: { username: true } },
      action: { select: { reason: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="py-8 max-w-2xl mx-auto space-y-6 px-4 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
          ⚖️ Crowd-Sourced Jury Tribunals
        </h1>
        <p className="text-sm font-semibold text-gray-400 dark:text-gray-400 mt-1">
          Review community enforcement appeals anonymously to uphold community standards or overturn wrongful bans.
        </p>
      </div>

      <div className="space-y-4">
        {openCases.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-400 font-medium italic shadow-sm text-xs select-none">
            🎉 Excellent work! The jury docket is clean. There are currently no pending ban disputes available for evaluation.
          </div>
        ) : (
          openCases.map((c) => (
            <TribunalVoteCard
              key={c.id}
              caseId={c.id}
              subredditName={c.subreddit.name}
              targetUsername={c.user.username || "anonymous"}
              appealReason={c.reason}
              banReason={c.action.reason || "No specification provided."}
            />
          ))
        )}
      </div>
    </div>
  );
}
