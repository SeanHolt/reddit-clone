"use client";

export function AntiRaidSyncToggle() {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-2 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 select-none uppercase font-black text-[10px] tracking-wider">
        <span>🔒 Shared Anti-Raid Blacklist Sync Active</span>
      </div>
      
      <p className="text-gray-400 font-medium leading-relaxed">
        Network defenses are operational! Local moderator shadow-ban commands will now automatically broadcast and sync user blocks across all allied federation nodes instantly.
      </p>
    </div>
  );
}
