"use client";

import { useState } from "react";
import Link from "next/link";
import { CommentVoteController } from "./CommentVoteController";

// Export the specific relational interface your parent layout needs to pass validation
export interface CommentTreeExtended {
  id: string;
  text: string;
  parentId: string | null;
  postId: string;
  createdAt: string | Date;
  author: {
    username: string | null;
    displayName: string | null;
  } | null;
  votes: {
    type: string;
    userId: string;
  }[];
}

interface CommentNodeProps {
  comment: CommentTreeExtended;
  currentUserId: string | null;
  renderReplies?: (parentId: string) => React.ReactNode;
}

export function CommentNode({ comment, currentUserId, renderReplies }: CommentNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const upvotes = comment.votes.filter((v) => v.type === "UP").length;
  const downvotes = comment.votes.filter((v) => v.type === "DOWN").length;
  const userVoteRecord = comment.votes.find((v) => v.userId === currentUserId);

  if (isCollapsed) {
    return (
      <div className="text-xs font-semibold text-gray-400 bg-gray-50/50 dark:bg-gray-950/10 px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center gap-2 select-none">
        <button type="button" onClick={() => setIsCollapsed(false)} className="text-orange-600 hover:text-orange-500 font-bold p-0.5">[+] expand thread</button>
        <span>u/{comment.author?.username || "anonymous"} thread hidden</span>
      </div>
    );
  }

  return (
    <div className="text-sm bg-gray-50/40 dark:bg-gray-950/10 p-4 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2 transition-colors duration-200">
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium select-none">
        <div className="flex items-center gap-1.5">
          <Link href={`/u/${comment.author?.username}`} className="font-bold text-gray-700 dark:text-gray-300 hover:underline">u/{comment.author?.username || "anonymous"}</Link>
          <span>• {new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <button type="button" onClick={() => setIsCollapsed(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold font-mono">[-] collapse</button>
      </div>

      <p className="text-gray-800 dark:text-gray-200 pl-0.5 leading-relaxed break-words">{comment.text}</p>

      <div className="pt-1 flex items-center gap-4 text-xs font-semibold select-none text-gray-400">
        <CommentVoteController
          commentId={comment.id}
          initialScore={upvotes - downvotes}
          currentVote={userVoteRecord ? (userVoteRecord.type as "UP" | "DOWN") : null}
          hasUser={!!currentUserId}
        />
        {currentUserId && (
          <button type="button" onClick={() => setIsReplying(!isReplying)} className="hover:text-orange-600 transition flex items-center gap-1">
            💬 {isReplying ? "Cancel Reply" : "Reply"}
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-2 border-l-2 border-orange-500/30 pl-3 pt-1 animate-fadeIn">
          <p className="text-[10px] text-gray-400 font-bold italic">Drafting nested tree reply response string...</p>
        </div>
      )}

      {renderReplies && (
        <div className="mt-3 space-y-3">
          {renderReplies(comment.id)}
        </div>
      )}
    </div>
  );
}
