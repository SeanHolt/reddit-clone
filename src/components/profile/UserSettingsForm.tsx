"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserSettingsFormProps {
  initialDisplayName: string;
  initialBio: string;
  initialImage: string;
}

export function UserSettingsForm({ initialDisplayName, initialBio, initialImage }: UserSettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [image, setImage] = useState(initialImage);
  const [fileData, setFileData] = useState<{ name: string; base64Data: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFileData({ name: file.name, base64Data: base64String });
      setImage(base64String); // Optimistic UI avatar frame update
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), bio: bio.trim(), file: fileData }),
      });

      if (!res.ok) throw new Error("Failed to commit settings configuration metadata matrices.");
      setMessage({ text: "Profile settings updated successfully!", isError: false });
      router.refresh();
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : "An error occurred.", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-4 p-2 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100 dark:border-gray-800 rounded-xl">
        <img src={image || "/default-avatar.png"} alt="Avatar Preview" className="h-14 w-14 rounded-full object-cover border border-gray-200 dark:border-gray-800 shadow-sm" />
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Upload Avatar Image File</label>
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 dark:file:bg-gray-800 dark:file:text-gray-300 hover:file:bg-orange-100 cursor-pointer" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">Public Display Name</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isLoading} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">About Bio / Description</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={isLoading} rows={3} className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-orange-500 resize-none" />
      </div>
      {message && <p className={`text-xs font-bold ${message.isError ? "text-red-500" : "text-green-600"}`}>{message.text}</p>}
      <button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-500 font-bold text-white rounded-full py-2 text-sm shadow-sm transition disabled:opacity-50">Save Profile Configuration</button>
    </form>
  );
}
