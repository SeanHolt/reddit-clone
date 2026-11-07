"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";

export function ThreadInterceptorModalWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleDismiss = () => {
    // Back out of the parallel path view slot natively to unmount the modal view layers
    router.back();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 transition-all duration-200 animate-fadeIn">
      {/* Clickable Backdrop Mask Overlay Layer */}
      <div className="absolute inset-0 cursor-zoom-out" onClick={handleDismiss} ref={overlayRef} />
      
      {/* Modal Dialog Body Box Sheet Content */}
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col z-10 animate-scaleUp">
        <div className="sticky top-0 right-0 p-3 flex justify-end bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 z-20">
          <button type="button" onClick={handleDismiss} className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-md transition shadow-2xs">
            ✕ Close View
          </button>
        </div>
        <div className="flex-1 p-2">{children}</div>
      </div>
    </div>
  );
}
