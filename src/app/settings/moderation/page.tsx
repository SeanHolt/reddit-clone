import { Suspense } from "react";
import { ModeratorQueueList } from "@/components/subreddit/ModeratorQueueList";
import { ModAuditLogStream } from "@/components/subreddit/ModAuditLogStream"; // Import the log component

export default function ModerationDashboardPage() {
  return (
    <div className="py-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">Moderation Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review queue logs and enforcement history tools filed across your created communities.</p>
      </div>

      <Suspense fallback={
        <div className="space-y-4 animate-pulse max-w-2xl">
          <div className="h-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl" />
        </div>
      }>
        <ModeratorQueueList />
      </Suspense>

      {/* Embedded Relational System Audit Section Log */}
      <Suspense fallback={
        <div className="h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse" />
      }>
        <ModAuditLogStream />
      </Suspense>
    </div>
  );
}
