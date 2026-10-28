import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { targetId, targetType, reason } = await req.json();
    if (!targetId || !["POST", "COMMENT"].includes(targetType) || !reason) {
      return NextResponse.json({ message: "Invalid payload parameters." }, { status: 422 });
    }

    // 1. Log the content violation record inside SQLite
    const report = await db.report.create({
      data: {
        reason,
        userId: session.user.id,
        postId: targetType === "POST" ? targetId : null,
        commentId: targetType === "COMMENT" ? targetId : null,
      },
    });

    // 2. Locate the parent post context to trace the target subreddit creator ID
    let currentPostId = report.postId;
    if (targetType === "COMMENT" && report.commentId) {
      const commentRecord = await db.comment.findUnique({
        where: { id: report.commentId },
        select: { postId: true },
      });
      if (commentRecord) currentPostId = commentRecord.postId;
    }

    if (currentPostId) {
      const targetPost = await db.post.findUnique({
        where: { id: currentPostId },
        include: { subreddit: true },
      });

      // 3. Trigger Notification: Alert the moderator if they aren't the reporter
      if (targetPost && targetPost.subreddit.creatorId !== session.user.id) {
        await createNotification({
          userId: targetPost.subreddit.creatorId,
          postId: targetPost.id,
          type: "MOD_REPORT",
          message: `🛡️ Mod Alert: An item in r/${targetPost.subreddit.name} has been flagged for ${reason.toLowerCase()}.`,
        });
      }
    }

    return NextResponse.json({ message: "Report submitted successfully." }, { status: 201 });
  } catch (error: unknown) {
    logServerError(error, "CONTENT_REPORT_POST_API");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}