"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FederationTimelineTabsProps {
  currentFeed: string;
  hasFederation: boolean;
}

export function FederationTimelineTabs({ currentFeed, hasFederation }: FederationTimelineTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (!hasFederation) return null;

  const handleTabChange = (type: "LOCAL" | "FEDERATION") => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("feedMode", type);
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex border-b border-gray-100 dark:border-gray-800/80 text-xs font-black uppercase tracking-wider select-none bg-transparent gap-4 pb-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleTabChange("LOCAL")}
        className={`pb-1 transition border-b-2 cursor-pointer ${
          currentFeed !== "FEDERATION"
            ? "border-orange-600 text-gray-900 dark:text-gray-50"
            : "border-transparent text-gray-400 hover:text-gray-500"
        }`}
      >
        🏠 Local Feed
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => handleTabChange("FEDERATION")}
        className={`pb-1 transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
          currentFeed === "FEDERATION"
            ? "border-orange-600 text-gray-900 dark:text-gray-50"
            : "border-transparent text-gray-400 hover:text-gray-500"
        }`}
      >
        🌐 Allied Federation Timeline
      </button>
    </div>
  );
}
