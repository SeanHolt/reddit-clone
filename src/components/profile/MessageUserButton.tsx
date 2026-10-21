"use client";

import { useRouter } from "next/navigation";

interface MessageUserButtonProps {
  targetUserId: string;
  targetUsername: string;
  currentUserId: string | null;
}

export function MessageUserButton({ targetUserId, targetUsername, currentUserId }: MessageUserButtonProps) {
  const router = useRouter();

  const handleStartConversation = () => {
    if (!currentUserId) return alert("Please log in to initiate private messages!");
    if (currentUserId === targetUserId) return alert("You cannot send a message to yourself.");

    // Fixed: Switch parameter to a clean lowercase field 'partnerid' to protect parameter hydration
    router.push(`/messages?partnerid=${targetUserId}&username=${targetUsername}`);
  };

  return (
    <button
      type="button"
      onClick={handleStartConversation}
      className="px-4 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-all select-none"
    >
      💬 Message u/{targetUsername}
    </button>
  );
}