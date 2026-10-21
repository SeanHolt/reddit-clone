"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";

interface FileUploadZoneProps {
  onUploadSuccess: (url: string) => void;
  disabled?: boolean;
}

export function FileUploadZone({ onUploadSuccess, disabled = false }: FileUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);

    try {
      // 1. Stream the file directly from the browser canvas up to Vercel Blob storage
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      onUploadSuccess(newBlob.url);
    } catch (err) {
      console.error("STORAGE_UPLOAD_FAULT:", err);
      alert("Failed to upload the image file asset to cloud storage.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-950/20 text-center select-none transition">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled || isUploading}
        className="hidden"
      />
      
      <button
        type="button"
        disabled={disabled || isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="text-xs font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
      >
        {isUploading ? "Uploading File..." : "📁 Choose Image File"}
      </button>
      <p className="text-[10px] text-gray-400 mt-2 font-medium">Supports PNG, JPG, GIF, or WEBP up to 4MB</p>
    </div>
  );
}