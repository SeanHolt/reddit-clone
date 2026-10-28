"use client";

import { useEffect, useState } from "react";

interface TypingIndicatorProps {
  currentUserId: string;
  receiverId: string;
  receiverUsername: string;
  inputValue: string;
}

export function TypingIndicator({ currentUserId, receiverId, receiverUsername, inputValue }: TypingIndicatorProps) {
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);

  // Generate a predictable, sorted chat lane string to uniquely bind the two users together
  const channelId = [currentUserId, receiverId].sort().join("-");

  // 1. Broadcast Loop: Tell the server whenever the local user inputs text characters
  useEffect(() => {
    if (!inputValue.trim()) return;

    const broadcastKeystroke = async () => {
      try {
        await fetch("/api/messages/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId, channelId }),
        });
      } catch (err) {
        console.error(err);
      }
    };

    broadcastKeystroke();
  }, [inputValue, receiverId, channelId]);

  // 2. Listener Polling Loop: Periodically check if the conversation partner is typing
  useEffect(() => {
    if (!receiverId) return;

    const checkPartnerStatus = async () => {
      try {
        const res = await fetch(`/api/messages/typing?partnerId=${receiverId}&channelId=${channelId}`);
        if (res.ok) {
          const body = await res.json();
          setPartnerIsTyping(body.isTyping);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(checkPartnerStatus, 2500); // Polls every 2.5 seconds for instant updates
    return () => clearInterval(interval);
  }, [receiverId, channelId]);

  if (!partnerIsTyping) return <div className="h-4" />; // Maintain layout space bounds silently when idle

  return (
    <div className="px-4 py-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 select-none animate-pulse flex items-center gap-1">
      <span className="italic">u/{receiverUsername} is typing</span>
      <span className="flex gap-0.5 items-center">
        <span className="h-1 w-1 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1 w-1 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1 w-1 bg-orange-600 rounded-full animate-bounce" />
      </span>
    </div>
  );
}
