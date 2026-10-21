import { Suspense } from "react";
import { SubmitPostWrapper } from "@/components/posts/SubmitPostWrapper";

interface SubmitPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function SubmitPostPage({ params }: SubmitPostPageProps) {
  return (
    <div className="py-8 max-w-2xl mx-auto">
      {/* 
        The Suspense boundary wraps the async handler, isolating the build compiler 
        from runtime database parameters and user verification tracks.
      */}
      <Suspense fallback={
        <div className="w-full p-6 bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-full w-1/5" />
        </div>
      }>
        <SubmitPostWrapper slugPromise={params} />
      </Suspense>
    </div>
  );
}
