"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the caught exception safely to external instrumentation utilities
    console.error("GLOBAL_UI_BOUNDARY_CAUGHT:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center">
      <div className="bg-orange-50 text-orange-600 p-3 rounded-full text-2xl">⚠️</div>
      <h2 className="text-xl font-bold text-gray-900">Something went wrong!</h2>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        An unexpected application error occurred in this view section. Please try resetting the container feed.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2 text-xs font-semibold bg-orange-600 text-white rounded-full hover:bg-orange-500 transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>
  );
}
