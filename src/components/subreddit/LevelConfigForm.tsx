"use client";

export function LevelConfigForm() {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide select-none">
        📈 Subreddit Level multipliers
      </h3>
      <p className="text-gray-400 font-medium leading-relaxed">
        Localized progression is active platform-wide! Subscribers dynamically earn community experience points (XP) based on these automated system weight parameters:
      </p>

      <div className="space-y-1.5 p-3 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-100 dark:border-gray-800 font-mono text-[11px] font-bold">
        <div className="flex justify-between text-gray-900 dark:text-gray-200"><span>Spawn Thread Post</span><span className="text-orange-600">+20 XP</span></div>
        <div className="flex justify-between text-gray-900 dark:text-gray-200"><span>Write Feed Comment</span><span className="text-orange-600">+10 XP</span></div>
        <div className="flex justify-between text-gray-900 dark:text-gray-200"><span>Receive Post Upvote</span><span className="text-orange-600">+5 XP</span></div>
      </div>
    </div>
  );
}
