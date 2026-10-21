import { Suspense } from "react";
import { CreateCommunityWrapper } from "@/components/subreddit/CreateCommunityWrapper";

export default function CreateCommunitySettingsPage() {
  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
        Community Settings
      </h1>
      
      {/* 
        The Suspense boundary wraps the authentication checker, completely 
        isolating the static page shell from runtime request interruptions.
      */}
      <Suspense fallback={
        <div className="w-full max-w-xl p-6 bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-24 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-full w-1/4 pt-2" />
        </div>
      }>
        <CreateCommunityWrapper />
      </Suspense>
    </div>
  );
}
