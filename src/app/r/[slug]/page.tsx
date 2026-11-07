import { Suspense } from "react";
import { SubredditView } from "@/components/subreddit/SubredditView";

// FIXED: Exempt this dynamic parameter-bound segment from static pre-rendering validation gates
export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ feedMode?: string; sort?: string }>;
}

export default async function SubredditPage({ params, searchParams }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/20 transition-colors duration-200">
      <Suspense fallback={
        <div className="max-w-4xl mx-auto py-6 px-4 animate-pulse space-y-6">
          <div className="h-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl" />
          <div className="h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl" />
        </div>
      }>
        <SubredditView 
          slug={slug} 
          searchParamsPromise={searchParams} 
        />
      </Suspense>
    </div>
  );
}
