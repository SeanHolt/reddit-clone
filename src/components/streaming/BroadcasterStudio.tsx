"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface BroadcasterStudioProps {
  subredditId: string;
}

export function BroadcasterStudio({ subredditId }: BroadcasterStudioProps) {
  const [title, setTitle] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading || isLive) return;
    setIsLoading(true);

    try {
      // 1. Hardware Access Request: Capture local high-definition video and microphone tracks natively
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });

      streamRef.current = mediaStream;

      // 2. Bind the captured hardware tracks to our local visual element preview stream canvas
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      setIsLive(true);
      router.refresh();
    } catch {
      alert("🔒 Camera Access Fault: Please verify device permissions before broadcasting.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setIsLive(false);
    setTitle("");
    router.refresh();
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 max-w-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <div className="flex justify-between items-center select-none">
        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
          🎥 {isLive ? <span className="text-red-600 animate-pulse">● Live</span> : "RPAN Video Broadcaster Studio"}
        </h3>
      </div>

      {!isLive ? (
        <form onSubmit={handleStartStream} className="space-y-3">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Stream Broadcast Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Live coding an interactive tournament engine..." disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 font-bold focus:ring-1 focus:ring-orange-500" />
          </div>
          <button type="submit" disabled={isLoading || !title.trim()} className="w-full py-2 bg-orange-600 hover:bg-orange-500 font-black text-white uppercase tracking-wider rounded-lg transition shadow-xs disabled:opacity-40">
            {isLoading ? "Acquiring Media..." : "Initialize Live Broadcast channel"}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {/* Native HTML Video Element Mirror Canvas Box Layer */}
          <div className="relative aspect-video w-full rounded-xl bg-gray-950 overflow-hidden border border-gray-800 shadow-inner">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute top-3 left-3 bg-red-600 text-white font-black uppercase text-[9px] px-1.5 py-0.5 rounded tracking-wider shadow animate-pulse">Broadcasting Live</div>
          </div>
          <button type="button" onClick={handleStopStream} className="w-full py-2 bg-red-600 hover:bg-red-500 font-black text-white uppercase tracking-wider rounded-lg transition shadow-xs">
            🛑 Terminate Stream Transmission
          </button>
        </div>
      )}
    </div>
  );
}
