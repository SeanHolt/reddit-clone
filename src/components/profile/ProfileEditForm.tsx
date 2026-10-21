"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileEditFormProps {
  user: {
    displayName: string | null;
    bio: string | null;
    image: string | null;
  };
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, imageUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile settings.");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Customize Profile</h2>
        <p className="text-xs text-gray-500 mb-4">Set your public display name, avatar artwork, and bio description details.</p>
        
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g., Sean H"
          disabled={isLoading}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Avatar Image URL</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={isLoading}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">About Me (Bio)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the community about yourself..."
          disabled={isLoading}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 resize-none"
        />
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {success && <p className="text-xs font-medium text-green-600">Profile configuration updated successfully!</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-600 text-white rounded-full py-2 text-sm font-semibold hover:bg-orange-500 transition disabled:opacity-50"
      >
        {isLoading ? "Saving settings..." : "Save Changes"}
      </button>
    </form>
  );
}
