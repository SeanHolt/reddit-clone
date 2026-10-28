import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { processVoteReward } from "@/lib/vote-rewards";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.username) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { targetId, targetType, voteType } = await req.json();

    if (!targetId || !["POST", "COMMENT"].includes(targetType) || !["UP", "DOWN"].includes(voteType)) {
      return NextResponse.json({ message: "Invalid payload parameters." }, { status: 422 });
    }

    // Determine target record lookup parameters dynamically
    const queryCriteria = targetType === "POST"
      ? { userId_postId: { userId: session.user.id, postId: targetId } }
      : { userId_commentId: { userId: session.user.id, commentId: targetId } };

    const existingVote = await db.vote.findUnique({
      where: queryCriteria
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({ where: queryCriteria });
      } else {
        await db.vote.update({
          where: queryCriteria,
          data: { type: voteType },
        });
      }
    } else {
      await db.vote.create({
        data: {
          type: voteType,
          userId: session.user.id,
          postId: targetType === "POST" ? targetId : null,
          commentId: targetType === "COMMENT" ? targetId : null,
        },
      });
    }

    // Recalculate target author profile scores asynchronously
    if (targetType === "POST") {
      const postRecord = await db.post.findUnique({ where: { id: targetId }, select: { authorId: true } });
      if (postRecord) {
        const { syncPostKarma } = await import("@/lib/karma");
        await syncPostKarma(postRecord.authorId);
      }
    } else {
      const commentRecord = await db.comment.findUnique({ where: { id: targetId }, select: { authorId: true } });
      if (commentRecord) {
        const { syncCommentKarma } = await import("@/lib/karma");
        await syncCommentKarma(commentRecord.authorId);
      }
    }
    processVoteReward({ postId:targetId, voterId: session.user.id, voteType }).catch(console.error);

    return NextResponse.json({ message: "Vote processed successfully." }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "VOTE_TOGGLE_API");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
