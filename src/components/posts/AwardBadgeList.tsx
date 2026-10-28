"use client";

import { useState } from "react";
import { AwardDrawer } from "./AwardDrawer";
import { AwardTier } from "@/lib/awards-config";

interface AwardItem {
  id: string;
  awardType: string;
}

interface AwardBadgeListProps {
  postId: string;
  initialAwards: AwardItem[];
  hasUser: boolean;
}

export function AwardBadgeList({ postId, initialAwards, hasUser }: AwardBadgeListProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group incoming platform award types to count distinct tier totals
  const counts = initialAwards.reduce((acc: Record<string, number>, curr) => {
    acc[curr.awardType] = (acc[curr.awardType] || 0) + 1;
    return acc;
  }, {});

  const emojiMap: Record<AwardTier, string> = { SILVER: "🥈", GOLD: "🥇", PLATINUM: "💎" };

  return (
    <div className="flex flex-wrap items-center gap-2 select-none min-h-[1.5rem]">
      {Object.keys(counts).map((tierKey) => {
        const type = tierKey as AwardTier;
        return (
          <span key={type} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded-full text-[10px] font-black text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
            <span>{emojiMap[type] || "🏆"}</span>
            <span className="font-mono">{counts[tierKey]}</span>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 hover:underline pt-0.5"
      >
        🌟 Gift Award
      </button>

      {isOpen && <AwardDrawer postId={postId} hasUser={hasUser} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
