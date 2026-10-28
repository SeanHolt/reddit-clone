import { db } from "@/lib/db";
import { modifyUserWallet } from "./economy";

interface ProcessVoteRewardParams {
  postId: string;
  voterId: string;
  voteType: "UP" | "DOWN";
}

/**
 * Background hook handler that scans a completed voting transaction 
 * and distributes platform coin credits to the content author [INDEX].
 */
export async function processVoteReward({ postId, voterId, voteType }: ProcessVoteRewardParams): Promise<void> {
  try {
    // Only credit authors for incoming UP upvotes; DOWN downvotes do not yield tokens
    if (voteType !== "UP") return;

    // 1. Hydrate the author profile ID of the target post card
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) return;

    // 2. Prevent authors from gaming the system by upvoting their own threads [INDEX]
    if (post.authorId === voterId) return;

    // 3. Atomically credit 5 platform tokens to the author wallet ledger
    await modifyUserWallet({
      userId: post.authorId,
      amount: 5,
      transactionType: "POST_UPVOTE_RECEIVED",
    });
  } catch (error: unknown) {
    console.error("VOTE_REWARD_PROCESSING_FAULT:", error);
  }
}
