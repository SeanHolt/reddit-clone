import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SignInButton } from "./auth/SignInButton";
import { SignOutButton } from "./auth/SignOutButton";

export async function NavbarProfile() {
  "use cache: private"; 

  const session = await auth();

  if (!session?.user?.id) {
    return <SignInButton />;
  }

  const username = session.user.username;

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <div className="flex items-center gap-4">
      {/* Public profile username link layout */}
      <Link 
        href={username ? `/u/${username}` : "/onboarding/username"}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 transition-colors hidden md:inline select-none"
      >
        u/{username || "claiming-handle..."}
      </Link>

      {/* Removed the 🛡️ Mod Queue link block completely from this row context */}

      <Link
        href="/messages"
        title="Chat Messenger Center"
        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </Link>

      <Link
        href="/settings/notifications"
        title={`${unreadCount} unread notifications`}
        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      <Link
        href="/settings/profile"
        title="User Settings Configuration"
        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors select-none"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Link>

      <SignOutButton />
    </div>
  );
}
