import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { reportId, action } = await req.json();

    if (!reportId || !["DISMISS", "DELETE_CONTENT"].includes(action)) {
      return NextResponse.json({ message: "Invalid action payload." }, { status: 422 });
    }

    // 1. Fetch report parameters to check community ownership mappings
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { post: { include: { subreddit: true } }, comment: { include: { post: { include: { subreddit: true } } } } }
    });

    if (!report) return NextResponse.json({ message: "Report not found" }, { status: 404 });

    // 2. Identify the target subreddit creator ID to enforce moderation rights
    const creatorId = report.post?.subreddit.creatorId || report.comment?.post.subreddit.creatorId;

    if (creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You are not a moderator here." }, { status: 403 });
    }

    // 3. Execute the moderation choice transactionally
    if (action === "DISMISS") {
      await db.report.delete({ where: { id: reportId } });
    } else if (action === "DELETE_CONTENT") {
      if (report.postId) {
        await db.post.delete({ where: { id: report.postId } });
      } else if (report.commentId) {
        await db.comment.delete({ where: { id: report.commentId } });
      }
    }

    return NextResponse.json({ message: "Moderation action recorded successfully." }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "MODERATION_RESOLVE_API");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}