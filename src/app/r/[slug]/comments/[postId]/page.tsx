import { Suspense } from "react";
import { SinglePostView } from "@/components/posts/SinglePostView";

interface SinglePostPageProps {
  params: Promise<{ slug: string; postId: string }>;
}

export default function SinglePostPage({ params }: SinglePostPageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-6 max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="flex bg-white border border-gray-200 rounded-xl h-48">
            <div className="w-10 bg-gray-50 h-full border-r border-gray-100" />
            <div className="p-5 flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl h-64" />
        </div>
      }
    >
      {/* Forward the unresolved reactive dynamic promises to stream independently */}
      <SinglePostView paramsPromise={params} />
    </Suspense>
  );
}
