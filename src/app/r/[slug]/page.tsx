import { Suspense } from "react";
import { SubredditView } from "@/components/subreddit/SubredditView";

interface SubredditPageProps {
  params: Promise<{ slug: string }>;
}

export default function SubredditPage({ params }: SubredditPageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="md:col-span-2 space-y-4">
            <div className="h-24 bg-white border border-gray-200 rounded-xl" />
            <div className="h-48 bg-white border border-gray-200 rounded-xl" />
          </div>
          <div className="h-36 bg-white border border-gray-200 rounded-xl" />
        </div>
      }
    >
      {/* Hand off the unresolved URL params promise to let it stream independently */}
      <SubredditView slugPromise={params} />
    </Suspense>
  );
}
