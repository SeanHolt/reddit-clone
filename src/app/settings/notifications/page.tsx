import { Suspense } from "react";
import { NotificationList } from "@/components/profile/NotificationList";

export default function NotificationsSettingsPage() {
  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">Inbox Notification Logs</h1>
      <Suspense fallback={
        <div className="space-y-3 animate-pulse max-w-xl">
          <div className="h-16 bg-white border border-gray-200 rounded-xl" />
          <div className="h-16 bg-white border border-gray-200 rounded-xl" />
        </div>
      }>
        <NotificationList />
      </Suspense>
    </div>
  );
}
