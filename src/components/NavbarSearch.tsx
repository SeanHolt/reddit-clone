"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SubredditResult {
  id: string;
  name: string;
}

export function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [subs, setSubs] = useState<SubredditResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSubs([]);
      return;
    }
    const fetchSubs = async () => {
      try {
        const res = await fetch(`/api/search/subreddit?q=${encodeURIComponent(query)}`);
        if (res.ok) setSubs(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(fetchSubs, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-xl flex-1 mx-4">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search titles or text (Press Enter to search posts)"
        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
      />

      {isOpen && (query.trim().length >= 2 || subs.length > 0) && (
        <div className="absolute top-11 inset-x-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-50">
          <ul className="py-1 divide-y divide-gray-50 dark:divide-gray-800">
            {query.trim() && (
              <li>
                <button type="button" onClick={() => { setIsOpen(false); router.push(`/search?q=${encodeURIComponent(query.trim())}`); }} className="w-full text-left px-4 py-2 text-xs text-orange-600 dark:text-orange-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">
                  🔍 Search all posts for `{query}` →
                </button>
              </li>
            )}
            {subs.map((sub) => (
              <li key={sub.id}>
                <Link href={`/r/${sub.name}`} onClick={() => { setIsOpen(false); setQuery(""); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                  r/{sub.name} <span className="text-[10px] text-gray-400 ml-1">(Community)</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
