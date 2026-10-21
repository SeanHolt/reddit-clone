import { Suspense } from "react";
import { PostSearchResults } from "@/components/search/PostSearchResults";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">Search Results</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discovery log matching your database query filters.</p>
      </div>

      <Suspense fallback={
        <div className="space-y-4 animate-pulse">
          <div className="bg-white dark:bg-gray-900 h-32 border border-gray-200 dark:border-gray-800 rounded-xl" />
          <div className="bg-white dark:bg-gray-900 h-32 border border-gray-200 dark:border-gray-800 rounded-xl" />
        </div>
      }>
        <PostSearchResults searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
