import { auth } from "@/auth";
import Link from "next/link";
import { connection } from "next/server";

export async function CreateCommunitySidebarCard() {
    await connection(); // Ensure the database connection is established before proceeding
    const session = await auth();

    // If the user is unauthenticated, hide the creation callout row to save screen layout metrics
    if (!session?.user?.id) return null;

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-2.5 transition-colors duration-200 select-none">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                <span>🌐 Community Blueprint Workspace</span>
            </div>

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-normal">
                Got a unique topic node or hobby circle? Spawn a dedicated neighborhood forum and manage your own automated AutoMod filters instantly!
            </p>

            <Link
                href="/settings/create-community"
                className="block w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-center text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-xs"
            >
                ➕ Create New Community
            </Link>
        </div>
    );
}
