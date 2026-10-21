import { db } from "@/lib/db";
import Link from "next/link";

interface MessageSidebarProps {
  currentUserId: string;
  activeChatUserId?: string;
}

export async function MessageSidebar({ currentUserId, activeChatUserId }: MessageSidebarProps) {
  // Query messages involving the active session user to gather thread interactions
  const messages = await db.directMessage.findMany({
    where: {
      OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    },
    include: { sender: true, receiver: true },
    orderBy: { createdAt: "desc" },
  });

  // Extract unique conversation partner profiles atomically into a tracking map
  const threadsMap = new Map<string, { id: string; username: string; image: string | null; lastText: string }>();

  messages.forEach((msg) => {
    const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;
    if (!threadsMap.has(partner.id)) {
      threadsMap.set(partner.id, {
        id: partner.id,
        username: partner.username || "anonymous",
        image: partner.image,
        lastText: msg.text,
      });
    }
  });

  const activeThreads = Array.from(threadsMap.values());

  return (
    <div className="w-full md:w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 flex flex-col h-[75vh]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold text-xs text-gray-400 uppercase tracking-wider">
        Private Threads ({activeThreads.length})
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50">
        {activeThreads.length === 0 ? (
          <p className="p-4 text-xs text-gray-400 font-medium italic text-center">No active chats.</p>
        ) : (
          activeThreads.map((t) => {
            const isActive = t.id === activeChatUserId;
            return (
              <Link
                key={t.id}
                href={`/messages?u=${t.id}`}
                className={`block px-4 py-3 text-left transition select-none ${
                  isActive ? "bg-orange-50 dark:bg-orange-950/20 border-l-4 border-l-orange-600" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <div className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">u/{t.username}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium">{t.lastText}</div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}