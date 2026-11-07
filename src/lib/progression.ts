import { db } from "@/lib/db";

interface AwardXpParams {
  userId: string;
  subredditId: string;
  actionType: "POST" | "COMMENT" | "RECEIVE_UPVOTE";
}

// XP Multiplier dictionary weights configurations
const XP_WEIGHTS: Record<string, number> = {
  POST: 20,
  COMMENT: 10,
  RECEIVE_UPVOTE: 5
};

/**
 * Calculates level thresholds mathematically using a standard progressive curve.
 * Level 1 -> 0 XP, Level 2 -> 100 XP, Level 3 -> 300 XP, etc.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * 100 + (level - 2) * 50;
}

export async function awardSubredditXp({ userId, subredditId, actionType }: AwardXpParams): Promise<void> {
  const pointsToGained = XP_WEIGHTS[actionType] || 0;
  if (pointsToGained === 0) return;

  try {
    await db.$transaction(async (tx) => {
      // 1. Atomically upsert the progress tracking ledger row
      const progress = await tx.userSubredditProgress.upsert({
        where: { userId_subredditId: { userId, subredditId } },
        update: { xp: { increment: pointsToGained } },
        create: { userId, subredditId, xp: pointsToGained, level: 1 }
      });

      // 2. Check if current total XP satisfies the boundary for a level up promotion
      const nextLevelThreshold = getXpRequiredForLevel(progress.level + 1);
      if (progress.xp >= nextLevelThreshold) {
        await tx.userSubredditProgress.update({
          where: { id: progress.id },
          data: { level: progress.level + 1 }
        });
      }
    });
  } catch (error: unknown) {
    console.error("XP_TRANSACTION_ENGINE_FAULT:", error);
  }
}
