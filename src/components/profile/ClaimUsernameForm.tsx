"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimUsernameForm() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanHandle = username.trim().toLowerCase();
    
    // Alphanumeric handle verification parameters
    if (cleanHandle.length < 3 || cleanHandle.length > 15 || !/^[a-z0-9_]+$/.test(cleanHandle)) {
      setError("Username must be 3-15 characters and contain only lowercase letters, numbers, or underscores.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/claim-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanHandle }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to claim handle.");
      }

      alert("Username claimed successfully! Welcome aboard.");
      router.refresh();
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleClaimSubmit} className="space-y-4 max-w-md bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm transition-colors duration-200 mx-auto">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Claim Your Handle</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Choose a permanent unique handle. This will build your personal public layout profile route link path index matrix (e.g. u/username).</p>
      
      <div className="relative flex items-center">
        <span className="absolute left-3 text-xs font-bold text-gray-400 select-none">u/</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
          placeholder="janesmith"
          required
          disabled={isLoading}
          className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100 font-semibold"
        />
      </div>

      {error && <p className="text-xs font-bold text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || username.trim().length < 3}
        className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-full transition disabled:opacity-50 shadow-sm"
      >
        {isLoading ? "Validating Handle..." : "Lock In Username"}
      </button>
    </form>
  );
}