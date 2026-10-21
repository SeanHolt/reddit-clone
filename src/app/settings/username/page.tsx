"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username || username.length < 3 || username.length > 21 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username must be between 3 and 21 alphanumeric characters or underscores.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/settings/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong.");
      }

      router.refresh();
      router.push("/");
    } catch (err: unknown) {
      // Definitive local narrowing: TypeScript now explicitly knows err is an Error object
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose your username</h1>
        <p className="text-sm text-gray-500 mb-6">This is how other redditors will see you. You cannot change this later.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-gray-400 font-medium text-sm">u/</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              disabled={isLoading}
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            />
          </div>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white rounded-full py-2 text-sm font-semibold hover:bg-orange-500 transition disabled:opacity-50">
            {isLoading ? "Setting handle..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
