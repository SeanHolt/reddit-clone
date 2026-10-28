"use client";

interface AuditLogItem {
  id: string;
  actionType: string;
  details: string;
  createdAt: string | Date;
  moderator: { username: string | null };
}

export function ModAuditStream({ logs }: { logs: AuditLogItem[] }) {
  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center text-gray-400 text-xs font-bold italic select-none">
        📋 Ledger Empty: No administrative events have been recorded inside this community timeline yet.
      </div>
    );
  }

  const badgeMap: Record<string, string> = {
    LOCKDOWN_TOGGLE: "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200",
    AUTOMOD_UPDATE: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200",
    BAN_USER: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-200",
    MOD_APPOINTED: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200"
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-4 text-xs font-semibold transition-colors duration-200">
      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide select-none">🛡️ Staff Action Audit Ledger</h3>
      
      <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 group animate-fadeIn">
            {/* Timeline Bullet Anchor Circle */}
            <div className="absolute top-1.5 left-2 h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-orange-500 transition-colors z-10" />
            
            <div className="space-y-1 max-w-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 border text-[9px] font-black uppercase rounded-md tracking-wider ${badgeMap[log.actionType] || "bg-gray-50 text-gray-600"}`}>
                  {log.actionType.replace("_", " ")}
                </span>
                <span className="text-gray-900 dark:text-gray-200 leading-normal">{log.details}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Logged by operator: <span className="font-bold">u/{log.moderator.username || "system"}</span></p>
            </div>
            
            <span className="text-[10px] text-gray-400 font-mono font-bold whitespace-nowrap self-start sm:self-center">
              {new Date(log.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
