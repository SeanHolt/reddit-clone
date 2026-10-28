"use client";

import { useEffect, useState } from "react";

export function PostAnalyticsGraph({ postId }: { postId: string }) {
  const [views, setViews] = useState<number[]>([]);
  const [clicks, setClicks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/posts/analytics?postId=${postId}`);
        if (res.ok) {
          const body = await res.json();
          setViews(body.viewCounts || []);
          setClicks(body.clickCounts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [postId]);

  if (isLoading || views.length === 0) return <div className="h-24 bg-gray-50 dark:bg-gray-950/40 animate-pulse rounded-lg border border-gray-100 dark:border-gray-800" />;

  const maxVal = Math.max(...views, ...clicks, 1);
  const width = 300, height = 60, pad = 5;

  const getSvgCoordinates = (arr: number[]) => arr.map((val, idx) => ({
    x: (idx / (arr.length - 1)) * (width - pad * 2) + pad,
    y: height - ((val / maxVal) * (height - pad * 2) + pad)
  }));

  const vPts = getSvgCoordinates(views);
  const cPts = getSvgCoordinates(clicks);

  const getPath = (pts: {x: number, y: number}[]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 transition-colors">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-gray-400">
        <span>📊 Complete 7-Day Performance Overlays</span>
        <div className="flex gap-3">
          <span className="text-orange-600">● Impressions</span>
          <span className="text-blue-500">● Share Clicks</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16 overflow-visible">
        <path d={getPath(vPts)} fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={getPath(cPts)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {vPts.map((p, i) => <circle key={`v-${i}`} cx={p.x} cy={p.y} r="2.5" className="fill-orange-600 stroke-white dark:stroke-gray-900 stroke-2" />)}
        {cPts.map((p, i) => <circle key={`c-${i}`} cx={p.x} cy={p.y} r="2.5" className="fill-blue-500 stroke-white dark:stroke-gray-900 stroke-2" />)}
      </svg>
    </div>
  );
}
