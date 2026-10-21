"use client";

import { useState } from "react";

interface ReportButtonProps {
  targetId: string;
  targetType: "POST" | "COMMENT";
  hasUser: boolean;
}

export function ReportButton({ targetId, targetType, hasUser }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReportSubmit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasUser) return alert("Please sign in to file content flags.");
    setIsLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, targetType, reason, details }),
      });

      if (!res.ok) throw new Error("Report transmission failed.");
      alert("Thank you. Content flagged for moderator review.");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error sending report.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        type="button" 
        onClick={(e) => { e.stopPropagation(); setIsOpen((prev) => !prev); }}
        className="text-xs font-semibold text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors select-none"
      >
        🏳️ Report
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 bottom-6 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 p-4 space-y-3 animate-fadeIn"
        >
          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">Flag Content Violation</h4>
          <select 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none text-gray-800 dark:text-gray-200 font-semibold"
          >
            <option value="SPAM">🎭 Spam or Deception</option>
            <option value="HARASSMENT">🛑 Harassment or Bullying</option>
            <option value="HATE_SPEECH">🔥 Hate Speech or Abuse</option>
            <option value="VIOLENCE">⚔️ Explicit Violence</option>
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Optional context details..."
            rows={2}
            className="w-full text-xs p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none resize-none font-sans text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <div className="flex justify-end gap-2 text-[10px] font-bold">
            <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2.5 py-1">Cancel</button>
            <button type="button" disabled={isLoading} onClick={handleReportSubmit} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded-full transition disabled:opacity-50">Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}