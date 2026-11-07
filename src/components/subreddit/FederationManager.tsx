"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FederationManager({ subredditId }: { subredditId: string }) {
  const [fedName, setFedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinFederation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fedName.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/subreddit/federation/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subredditId, federationName: fedName }),
      });

      if (res.ok) {
        alert(`🌐 Successfully established alliance contract inside the "${fedName}" Federation Network!`);
        setFedName("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoinFederation} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-3 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide select-none">
        🌐 Subreddit Federations Alliance Node
      </h3>
      <p className="text-gray-400 font-medium leading-relaxed">
        Issue or sign an alliance contract with partnering communities to aggregate your post streams and unify community defenses.
      </p>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={fedName}
          onChange={(e) => setFedName(e.target.value)}
          placeholder="Enter target Federation network name..."
          disabled={isLoading}
          required
          className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 font-bold"
        />
        <button type="submit" disabled={isLoading || !fedName.trim()} className="px-4 bg-orange-600 hover:bg-orange-500 font-black text-white uppercase tracking-wider rounded-lg transition disabled:opacity-40 shadow-sm shrink-0">
          {isLoading ? "Signing..." : "Link Alliance"}
        </button>
      </div>
    </form>
  );
}
