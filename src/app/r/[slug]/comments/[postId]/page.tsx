import { Suspense } from "react";
import { SinglePostView } from "@/components/posts/SinglePostView";

// FIXED: Exempt this dynamic parameter-bound segment from static pre-rendering validation gates
export const instant = false;

interface PageProps {
  params: Promise<{ slug: string; postId: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  // Await the asynchronous route context params promise cleanly on the server segment layer
  const { postId } = await params;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/20 transition-colors duration-200">
      <Suspense fallback={
        <div className="max-w-3xl mx-auto py-6 px-4 animate-pulse space-y-6">
          <div className="h-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl" />
          <div className="h-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl" />
        </div>
      }>
        {/* Pass the fully resolved plain string down cleanly to your layout view component */}
        <SinglePostView postId={postId} />
      </Suspense>
    </div>
  );
}