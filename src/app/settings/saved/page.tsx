import { Suspense } from "react";
import { SavedPostsStream } from "@/components/profile/SavedPostsStream";

export default function SavedVaultPage() {
  return (
    <div className="py-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">Saved Posts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your private sandbox repository collecting flagged bookmark items.</p>
      </div>

      <Suspense fallback={
        <div className="h-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse shadow-sm" />
      }>
        <SavedPostsStream />
      </Suspense>
    </div>
  );
}
