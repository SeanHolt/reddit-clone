"use client";

import { useEffect, useState } from "react";

interface ReadReceiptIndicatorProps {
  currentUserId: string;
  receiverId: string;
  lastMessageTimestamp: string | null;
}

export function ReadReceiptIndicator({ currentUserId, receiverId, lastMessageTimestamp }: ReadReceiptIndicatorProps) {
  const [partnerLastRead, setPartnerLastRead] = useState<string | null>(null);
  const channelId = [currentUserId, receiverId].sort().join("-");

  // 1. Broadcast Tracker: Alert the server that the local user is viewing this chat room layout split
  useEffect(() => {
    if (!receiverId) return;

    const fireReadReceiptPulse = async () => {
      try {
        await fetch("/api/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId }),
        });
      } catch (err) {
        console.error("READ_RECEIPT_BROADCAST_FAULT:", err);
      }
    };

    fireReadReceiptPulse();
  }, [receiverId, channelId, lastMessageTimestamp]); // Re-fires if incoming text counts increment

  // 2. Listener Polling Loop: Query the conversation partner's focus state continuously
  useEffect(() => {
    if (!receiverId) return;

    const queryPartnerReadTime = async () => {
      try {
        const res = await fetch(`/api/messages/read?receiverId=${receiverId}&channelId=${channelId}`);
        if (res.ok) {
          const body = await res.json();
          setPartnerLastRead(body.lastReadTime);
        }
      } catch (err) {
        console.error("READ_RECEIPT_POLL_FAULT:", err);
      }
    };

    const interval = setInterval(queryPartnerReadTime, 3000); // Poll focus windows every 3 seconds
    return () => clearInterval(interval);
  }, [receiverId, channelId]);

  if (!lastMessageTimestamp || !partnerLastRead) return <div className="h-3" />;

  // Verify if the partner's checkout log post-dates the exact generation moment of the last message
  const isMessageRead = new Date(partnerLastRead).getTime() >= new Date(lastMessageTimestamp).getTime();

  return (
    <div className="px-4 text-[10px] font-black uppercase text-right tracking-wider text-gray-400 select-none h-3 transition-all">
      {isMessageRead ? <span className="text-orange-600 dark:text-orange-400">✓ Read</span> : <span>Delivered</span>}
    </div>
  );
}
