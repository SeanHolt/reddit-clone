"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function QueueActionButtons({ reportId }: { reportId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "DISMISS" | "DELETE_CONTENT") => {
    if (action === "DELETE_CONTENT" && !confirm("Wipe out this violating content permanently?")) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/moderation/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });

      if (!res.ok) throw new Error("Failed to process queue selection.");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving resolution choice.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-2 text-xs font-bold pt-1 select-none">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleAction("DISMISS")}
        className="px-4 py-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        ✅ Dismiss Flag
      </button>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleAction("DELETE_CONTENT")}
        className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
      >
        🗑️ Remove Content
      </button>
    </div>
  );
}