"use client";

import { useEffect } from "react";

interface SubredditHeartbeatProps {
  subredditName: string;
  hasUser: boolean;
}

export function SubredditHeartbeat({ subredditName, hasUser }: SubredditHeartbeatProps) {
  useEffect(() => {
    if (!hasUser || !subredditName) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/subreddit/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subredditName }),
        });
      } catch (err) {
        console.error("HEARTBEAT_PING_ERROR:", err);
      }
    };

    sendHeartbeat(); // Fire immediately on initial page layout mount

    // Set up a rolling timer to ping the heartbeat loop every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [subredditName, hasUser]);

  return null;
}
