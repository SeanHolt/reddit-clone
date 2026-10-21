import { CommentNode } from "./CommentNode";
import { CommentForm } from "./CommentForm";
import { CommentTreeExtended } from "./CommentNode";

interface CommentSectionProps {
  comments: CommentTreeExtended[];
  postId: string;
  currentUserId?: string | null;
}

export function CommentSection({ comments, postId, currentUserId = null }: CommentSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-6 transition-colors duration-200">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Comments</h3>
      
      <CommentForm postId={postId} />

      <div className="pt-4 divide-y divide-gray-50 dark:divide-gray-800/50">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6 font-medium">No comments yet. Share your thoughts!</p>
        ) : (
          comments.map((comment) => (
            <CommentNode key={comment.id} comment={comment} currentUserId={currentUserId} />
          ))
        )}
        
      </div>
    </div>
  );
}
