import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { QueueActionButtons } from "./QueueActionButtons";
import { ModeratorBanForm } from "./ModeratorBanForm";
import { AutoModConfigForm } from "./AutoModConfigForm";
import { connection } from "next/server";
import { TransferOwnershipForm } from "./TransferOwnershipForm";
import { FlairManagementForm } from "./FlairManagementForm";
import { GateConfigForm } from "./GateConfigForm";

export async function ModeratorQueueList() {
    await connection();
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Find all subreddits this specific user created and owns
    const ownedSubreddits = await db.subreddit.findMany({
        where: { creatorId: session.user.id },
        select: {
            id: true,
            name: true,
            autoModKeywords: true,
            minAccountAgeDays: true, // Selected values
            minKarmaRequired: true
        } // Selected autoModKeywords
    });
    const ownedIds = ownedSubreddits.map((s) => s.id);

    // Pull reports matching those community IDs
    const reports = await db.report.findMany({
        where: {
            OR: [
                { post: { subredditId: { in: ownedIds } } },
                { comment: { post: { subredditId: { in: ownedIds } } } }
            ]
        },
        include: { post: true, comment: true, user: true },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-6 max-w-2xl">
            {/* 1. Injected: Render moderation entry forms for each owned community space */}
            <div className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">Community Enforcement Controls</h2>
                <div className="flex flex-col gap-3 sm:flex-row sm:wrap">
                    {ownedSubreddits.map((sub) => (
                        <div key={sub.id} className="space-y-3 p-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-800 rounded-xl">
                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-2 rounded border border-gray-100 dark:border-gray-800">
                                Community: r/{sub.name}
                            </div>

                            {/* 1. Restrict user ban panel controls */}
                            <ModeratorBanForm subredditId={sub.id} />

                            {/* 2. Automated AutoMod phrase filter keywords panel */}
                            <AutoModConfigForm subredditId={sub.id} initialKeywords={sub.autoModKeywords || ""} />

                            {/* RESTORED: 3. Dynamic subscriber user flair badge factory generation panel */}
                            <FlairManagementForm subredditId={sub.id} />

                            {/* 4. Subreddit user age and karma score entry restriction gates panel */}
                            <GateConfigForm subredditId={sub.id} initialAge={sub.minAccountAgeDays} initialKarma={sub.minKarmaRequired} />

                            {/* 5. Permanent administrator ownership relinquishing controls panel */}
                            <TransferOwnershipForm subredditId={sub.id} subredditName={sub.name} />
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Standard review queue items section header */}
            <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">Open Violation Flag Reports ({reports.length})</h2>
                {reports.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center text-gray-400 font-medium shadow-sm transition-colors">Clean queue! No reported violations to review.</div>
                ) : (
                    reports.map((r) => (
                        <div key={r.id} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 transition-colors">
                            {/* Report row card detail containers remain completely matching */}
                            <QueueActionButtons reportId={r.id} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}