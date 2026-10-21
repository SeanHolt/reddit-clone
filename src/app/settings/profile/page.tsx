import { Suspense } from "react";
import { UserSettingsLoader } from "@/components/profile/UserSettingsLoader";

export default function UserSettingsProfilePage() {
  return (
    <div className="py-8 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">Profile Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your stylized presentation details and public bio.</p>
      </div>

      <Suspense fallback={
        <div className="bg-white dark:bg-gray-900 h-64 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse shadow-sm" />
      }>
        <UserSettingsLoader />
      </Suspense>
    </div>
  );
}