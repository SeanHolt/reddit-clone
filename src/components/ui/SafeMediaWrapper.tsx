"use client";

import { useState } from "react";

interface SafeMediaWrapperProps {
  children: React.ReactNode;
  isNSFW: boolean;
  isSpoiler: boolean;
}

export function SafeMediaWrapper({ children, isNSFW, isSpoiler }: SafeMediaWrapperProps) {
  const needsBlur = isNSFW || isSpoiler;
  const [isRevealed, setIsRevealed] = useState(!needsBlur);

  if (!needsBlur || isRevealed) {
    return <>{children}</>;
  }

  return (
    <div 
      onClick={() => setIsRevealed(true)}
      className="relative cursor-pointer rounded-xl overflow-hidden group select-none mt-3 animate-fadeIn"
    >
      {/* 1. Blurred Background Mirror Effect Layout Box */}
      <div className="blur-xl grayscale opacity-40 brightness-50 pointer-events-none scale-105 transition-all">
        {children}
      </div>

      {/* 2. Floating Centered Text Warning Overlay Panel */}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center transition-colors group-hover:bg-black/50">
        <span className="text-2xl mb-1">
          {isNSFW ? "🔞" : "⚠️"}
        </span>
        <h4 className="text-xs font-black uppercase tracking-wider text-white">
          {isNSFW ? "NSFW Content" : "Spoiler Warning"}
        </h4>
        <p className="text-[10px] font-bold text-gray-200 mt-0.5">
          Click anywhere to reveal media layout
        </p>
      </div>
    </div>
  );
}