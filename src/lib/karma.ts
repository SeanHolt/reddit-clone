import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

interface AwardKarmaParams {
  userId: string;
  points: number;
  type: "POST_UPVOTE" | "COMMENT_UPVOTE";
  reason: string;
}
/**
 * Synchronizes and updates a target user's public postKarma field 
 * by calculating the net score of all posts they have authored.
 */
export async function syncPostKarma(authorId: string): Promise<void> {
  try {
    const authoredPosts = await db.post.findMany({
      where: { authorId },
      include: { votes: true },
    });

    let totalPostKarma = 0;
    authoredPosts.forEach((post) => {
      const upvotes = post.votes.filter((v) => v.type === "UP").length;
      const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
      totalPostKarma += upvotes - downvotes;
    });

    await db.user.update({
      where: { id: authorId },
      data: { postKarma: totalPostKarma },
    });
  } catch (error: unknown) {
    logServerError(error, "SYNC_POST_KARMA_ENGINE");
    throw error;
  }
}

/**
 * Synchronizes and updates a target user's public commentKarma field 
 * by calculating the net score of all comments they have submitted.
 */
export async function syncCommentKarma(authorId: string): Promise<void> {
  try {
    const authoredComments = await db.comment.findMany({
      where: { authorId },
      include: { votes: true },
    });

    let totalCommentKarma = 0;
    authoredComments.forEach((comment) => {
      const upvotes = comment.votes.filter((v) => v.type === "UP").length;
      const downvotes = comment.votes.filter((v) => v.type === "DOWN").length;
      totalCommentKarma += upvotes - downvotes;
    });

    await db.user.update({
      where: { id: authorId },
      data: { commentKarma: totalCommentKarma },
    });
  } catch (error: unknown) {
    logServerError(error, "SYNC_COMMENT_KARMA_ENGINE");
    throw error;
  }
}
/**
 * Updates user karma counts, appends logs to the ledger history, 
 * and fires celebratory inbox notifications on milestones.
 */
export async function awardKarma({ userId, points, type, reason }: AwardKarmaParams): Promise<void> {
  try {
    // 1. Log the points delta entry directly into your relational ledger table
    await db.karmaLog.create({
      data: { userId, points, type, reason },
    });

    // 2. Increment user counts using native atomic field step operations
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        postKarma: type === "POST_UPVOTE" ? { increment: points } : undefined,
        commentKarma: type === "COMMENT_UPVOTE" ? { increment: points } : undefined,
      },
      select: { postKarma: true, commentKarma: true },
    });

    const totalKarma = updatedUser.postKarma + updatedUser.commentKarma;

    // 3. Trigger Milestone Alerts: Check if total karma is exactly a target milestone
    const isMilestone = totalKarma === 10 || totalKarma === 100 || totalKarma === 500 || totalKarma === 1000;

    if (isMilestone) {
      const { createNotification } = await import("@/lib/notifications");
      
      const samplePost = await db.post.findFirst({ 
        where: { authorId: userId } 
      });
      
      if (samplePost) {
        await createNotification({
          userId,
          postId: samplePost.id,
          type: "COMMENT",
          message: `🎉 Milestone Unlocked: Congratulations! Your profile has crossed ${totalKarma} net total karma points!`,
        });
      }
    }
  } catch (error: unknown) {
    logServerError(error, "AWARD_KARMA_ENGINE_CRASH");
  }
}