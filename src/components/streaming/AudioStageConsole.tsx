"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface AudioStageConsoleProps {
  subredditId: string;
}

export function AudioStageConsole({ subredditId }: AudioStageConsoleProps) {
  const [title, setTitle] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const router = useRouter();

  const handleStartTalk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading || isLive) return;
    setIsLoading(true);

    try {
      // 1. Hardware Access Request: Capture local microphone audio track natively
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      audioStreamRef.current = mediaStream;
      setIsLive(true);
      router.refresh();
    } catch (err) {
      alert("🔒 Microphone Access Fault: Please verify device permissions before speaking.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMute = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleEndTalk = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setIsLive(false);
    setIsMuted(false);
    setTitle("");
    router.refresh();
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 max-w-xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
      <div className="flex justify-between items-center select-none">
        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
          🎙️ {isLive ? <span className="text-emerald-600 animate-pulse">● Active Stage</span> : "Virtual Stage Audio Studio"}
        </h3>
      </div>

      {!isLive ? (
        <form onSubmit={handleStartTalk} className="space-y-3">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Audio Space Discussion Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Community Town Hall: Q4 Roadmap Planning..." disabled={isLoading} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg outline-none text-gray-900 dark:text-gray-100 font-bold focus:ring-1 focus:ring-orange-500" />
          </div>
          <button type="submit" disabled={isLoading || !title.trim()} className="w-full py-2 bg-gray-950 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 font-black text-white uppercase tracking-wider rounded-lg transition shadow-xs disabled:opacity-40">
            {isLoading ? "Acquiring Mic..." : "Initialize Virtual Audio Space"}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg ${isMuted ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600 animate-bounce"}`}>
              {isMuted ? "🎙️" : "🗣️"}
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 leading-tight">{title}</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{isMuted ? "Microphone Muted" : "Your Mic is Live"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={handleToggleMute} className={`py-2 font-black uppercase tracking-wider rounded-lg transition shadow-xs ${isMuted ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
              {isMuted ? "🔊 Unmute Mic" : "🔇 Mute Mic"}
            </button>
            <button type="button" onClick={handleEndTalk} className="py-2 bg-red-600 hover:bg-red-500 font-black text-white uppercase tracking-wider rounded-lg transition shadow-xs">
              🛑 End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
