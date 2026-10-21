"use client";

import { useState } from "react";
import Image from "next/image";

interface MediaCarouselProps {
  mediaUrls: string[];
}

export function MediaCarousel({ mediaUrls }: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  return (
    <div className="relative max-w-xl mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 shadow-sm mt-3 group select-none animate-fadeIn">
      {/* Updated: Fixed explicit dimension limits paired with layout object-contain scaling rules */}
      <div className="h-64 sm:h-80 w-full flex justify-center items-center bg-black/40">
        <Image
          src={mediaUrls[activeIndex]}
          alt={`Post media slide view ${activeIndex + 1}`}
          width={800} 
          height={500}
          priority={activeIndex === 0}
          className="max-h-full max-w-full object-contain pointer-events-none"
        />
      </div>

      {mediaUrls.length > 1 && (
        <>
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
            {mediaUrls.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-all ${idx === activeIndex ? "bg-orange-600 scale-125" : "bg-white/60"}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition duration-200 font-bold text-xs z-10"
          >
            ◀
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition duration-200 font-bold text-xs z-10"
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
}