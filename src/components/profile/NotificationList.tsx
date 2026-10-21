import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export async function NotificationList() {
    await connection();
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const notifications = await db.notification.findMany({
        where: { userId: session.user.id },
        include: { post: { include: { subreddit: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    if (notifications.length > 0) {
        await db.notification.updateMany({
            where: { userId: session.user.id, isRead: false },
            data: { isRead: true },
        });
    }

    if (notifications.length === 0) {
        return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-400 font-medium rounded-xl shadow-sm">Your inbox is completely clear!</div>;
    }

    return (
        <div className="space-y-3 max-w-xl">
            {notifications.map((n) => {
                const isModAlert = n.type === "MOD_REPORT";
                return (
                    <div key={n.id} className={`p-4 border rounded-xl shadow-sm transition-all bg-white dark:bg-gray-900 ${isModAlert
                            ? "border-l-4 border-l-red-500 border-gray-200 dark:border-gray-800 bg-red-50/10 dark:bg-red-950/5"
                            : !n.isRead ? "border-l-4 border-l-orange-500 border-gray-200 dark:border-gray-800" : "border-gray-200 dark:border-gray-800"
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            {isModAlert && <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30 px-1.5 py-0.5 rounded">Moderation Queue</span>}
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{n.message}</p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 mt-2">
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                            <Link href={isModAlert ? "/settings/moderation" : `/r/${n.post.subreddit.name}/comments/${n.postId}`} className="text-orange-600 dark:text-orange-500 font-bold hover:underline">
                                {isModAlert ? "Open Mod Queue →" : "View Thread →"}
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}