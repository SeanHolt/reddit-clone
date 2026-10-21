"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function NavbarRecentDropdown() {
  const [recentSubs, setRecentSubs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Helper to read storage atomically without cascading effects
    const loadSubs = () => {
      const stored = localStorage.getItem("reddit_recent_subs");
      if (stored) setRecentSubs(JSON.parse(stored));
    };

    loadSubs(); // Load initially on mount

    // Listen for our tracker's custom window event update
    window.addEventListener("recent_subs_updated", loadSubs);
    
    const clickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", clickOutside);
    return () => {
      window.removeEventListener("recent_subs_updated", loadSubs);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);

  if (recentSubs.length === 0) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-all"
      >
        Communities ▾
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recent</p>
          {recentSubs.map((sub) => (
            <Link
              key={sub}
              href={`/r/${sub}`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors font-medium"
            >
              r/{sub}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
