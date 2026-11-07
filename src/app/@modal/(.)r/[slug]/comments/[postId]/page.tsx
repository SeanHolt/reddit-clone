import { Suspense } from "react";
import { SinglePostView } from "@/components/posts/SinglePostView";
import { ThreadInterceptorModalWrapper } from "@/components/posts/ThreadInterceptorModalWrapper";

export const instant = false;

interface InterceptedPageProps {
  params: Promise<{ slug: string; postId: string }>;
}

export default async function InterceptedPostDetailPage({ params }: InterceptedPageProps) {
  // Await the asynchronous route parameter promise on the intercepted server segment layer
  const { postId } = await params;

  return (
    <ThreadInterceptorModalWrapper>
      <Suspense fallback={
        <div className="p-6 animate-pulse space-y-4 text-xs font-semibold text-gray-400 select-none">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
          <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
        </div>
      }>
        {/* Re-mount our single post view layer cleanly straight inside the modal container portal */}
        <SinglePostView postId={postId} />
      </Suspense>
    </ThreadInterceptorModalWrapper>
  );
}
