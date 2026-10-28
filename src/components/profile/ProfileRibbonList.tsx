"use client";

import { ProfileRibbon } from "@/lib/achievements";

interface ProfileRibbonListProps {
  ribbons: ProfileRibbon[];
}

export function ProfileRibbonList({ ribbons }: ProfileRibbonListProps) {
  if (ribbons.length === 0) {
    return (
      <div className="text-[11px] font-bold text-gray-400 italic select-none border border-dashed border-gray-200 dark:border-gray-800 p-2.5 rounded-xl bg-gray-50/30 dark:bg-gray-950/10">
        🌱 Journey Initiated: Continue interacting across community boards to unlock visual merit tokens!
      </div>
    );
  }

  return (
    <div className="space-y-2 select-none">
      <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">🏅 Earned Achievement Ribbons</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ribbons.map((ribbon) => (
          <div
            key={ribbon.id}
            className={`group relative flex items-center gap-2.5 px-3 py-2 border rounded-xl shadow-xs transition-all hover:scale-[1.01] bg-white dark:bg-gray-950 ${ribbon.bgClass}`}
          >
            <span className="text-sm">{ribbon.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-black tracking-wide truncate ${ribbon.textClass}`}>
                {ribbon.label}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-400 font-medium truncate mt-0.5">
                {ribbon.description}
              </p>
            </div>

            {/* Hover Floating Detailed Context Tooltip Box */}
            <div className="absolute opacity-0 pointer-events-none group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-950 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-md transition-opacity duration-150 whitespace-nowrap z-40 dark:bg-white dark:text-gray-950">
              {ribbon.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
