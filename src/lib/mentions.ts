import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

interface ProcessMentionsParams {
  text: string;
  postId: string;
  authorId: string;
  sourceType: "POST" | "COMMENT";
}

/**
 * Scans text string matrices for `u/username` handles and dispatches 
 * targeted system inbox notification alerts to matched users.
 */
export async function processMentions({ text, postId, authorId, sourceType }: ProcessMentionsParams): Promise<void> {
  try {
    // 1. Extract unique u/username patterns using global regex markers
    const mentionRegex = /u\/([a-zA-Z0-9_]+)/g;
    const matches = Array.from(text.matchAll(mentionRegex));
    
    if (matches.length === 0) return;

    // Normalize handle text down to distinct lowercase strings
    const uniqueUsernames = Array.from(
      new Set(matches.map((match) => match[1].toLowerCase()))
    );

    // 2. Fetch corresponding user IDs across matched handles
    const targetUsers = await db.user.findMany({
      where: {
        username: { in: uniqueUsernames },
        id: { not: authorId }, // Prevent authors from alerting themselves
      },
      select: { id: true, username: true },
    });

    if (targetUsers.length === 0) return;

    // 3. Dispatch atomic notification items into the relational table records
    const { createNotification } = await import("@/lib/notifications");
    const label = sourceType === "POST" ? "a post thread" : "a comment stream";

    for (const target of targetUsers) {
      await createNotification({
        userId: target.id,
        postId,
        type: "COMMENT", // Aligns cleanly with compatible schema structural variants
        message: `👤 You were mentioned in ${label} by an author! Click here to jump straight to the discussion thread.`,
      });
    }
  } catch (error: unknown) {
    logServerError(error, "MENTION_PROCESSING_SYSTEM_CRASH");
  }
}
