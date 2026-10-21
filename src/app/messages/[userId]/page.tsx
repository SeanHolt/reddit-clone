import { Suspense } from "react";
import { DirectMessageWrapper } from "@/components/messages/DirectMessageWrapper";

interface DirectMessagePageProps {
  params: Promise<{ userId: string }>;
}

export default function DirectMessagePage({ params }: DirectMessagePageProps) {
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <Suspense
        fallback={
          <div className="w-full h-[75vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate-pulse flex flex-col overflow-hidden">
            <div className="h-12 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 w-full" />
            <div className="p-5 flex-1 space-y-3">
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/3" />
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-1/4 ml-auto" />
            </div>
            <div className="h-14 bg-gray-50 dark:bg-gray-800 w-full border-t border-gray-100 dark:border-gray-700" />
          </div>
        }
      >
        {/* Safely forward parameter promises directly down to let them resolve asynchronously */}
        <DirectMessageWrapper userIdPromise={params} />
      </Suspense>
    </div>
  );
}