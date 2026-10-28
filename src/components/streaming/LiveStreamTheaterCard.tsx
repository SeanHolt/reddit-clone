"use client";

import { useState, useRef, useEffect } from "react";

interface LiveStreamTheaterCardProps {
  streamId: string;
  title: string;
  initialViewerCount: number;
}

export function LiveStreamTheaterCard({ streamId, title, initialViewerCount }: LiveStreamTheaterCardProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [viewers, setViewers] = useState(initialViewerCount);
  const [isLoading, setIsLoading] = useState(false);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const handleTuneIn = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch the broadcaster's volatile WebRTC SDP offer from the signaling channel
      const res = await fetch(`/api/subreddit/stream/signal?streamId=${streamId}`);
      if (!res.ok) throw new Error("SIGNAL_FETCH_FAULT");
      const { sdpOffer } = await res.json();

      if (!sdpOffer) {
        alert("📺 Broadcast sync frame missing. Stream may be resolving.");
        setIsLoading(false);
        return;
      }

      // 2. Initialize a read-only local RTCPeerConnection downstream lane
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:://google.com" }]
      });
      pcRef.current = pc;

      // Bind incoming stream tracks natively to the video canvas layout element
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // 3. Negotiate the connection session descriptors
      await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: sdpOffer }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 4. Submit the negotiated answer back to complete the signaling circuit handshakes
      await fetch("/api/subreddit/stream/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "SUBMIT_ANSWER", streamId, sdpAnswer: answer.sdp })
      });

      setIsWatching(true);
      setViewers((prev) => prev + 1);
    } catch (err) {
      alert("❌ Signaling Handshake Error: Failed to synchronize live video tracks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 text-xs font-semibold text-gray-300 transition-colors shadow-xl">
      <div className="flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">RPAN Community Live Stream</span>
        </div>
        <span className="font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded text-[10px]">{viewers} watching</span>
      </div>

      <h2 className="text-sm font-black text-white leading-tight">{title}</h2>

      {!isWatching ? (
        <button
          type="button"
          disabled={isLoading}
          onClick={handleTuneIn}
          className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider rounded-lg transition shadow-md"
        >
          {isLoading ? "Synchronizing Downstream..." : "📺 Tune In Live"}
        </button>
      ) : (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-gray-800">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { if (pcRef.current) pcRef.current.close(); setIsWatching(false); setViewers((p) => Math.max(0, p - 1)); }}
            className="absolute bottom-3 right-3 px-3 py-1 bg-gray-900/80 hover:bg-gray-900 text-white text-[10px] font-black uppercase rounded shadow transition"
          >
            Leave Player
          </button>
        </div>
      )}
    </div>
  );
}
