import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { targetUsername, subredditId } = await req.json();
    if (!targetUsername || !subredditId) {
      return NextResponse.json({ message: "Missing payload parameters." }, { status: 422 });
    }

    // 1. Fetch community details to verify ownership rights
    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You do not own this community." }, { status: 403 });
    }

    // 2. Locate the new prospective owner's user record
    const newOwner = await db.user.findUnique({
      where: { username: targetUsername.trim().toLowerCase() },
    });
    if (!newOwner) return NextResponse.json({ message: "Target user not found." }, { status: 404 });
    if (newOwner.id === session.user.id) {
      return NextResponse.json({ message: "You already own this community." }, { status: 422 });
    }

    // 3. Atomically transfer ownership role status inside SQLite rows
    await db.subreddit.update({
      where: { id: subredditId },
      data: { creatorId: newOwner.id },
    });

    // 4. Log the action into our moderation audit log pipeline history index
    await db.moderationAction.create({
      data: {
        type: "TRANSFER",
        reason: `Transferred community ownership role explicitly to u/${newOwner.username}.`,
        userId: newOwner.id,
        subredditId,
      },
    });

    return NextResponse.json({ success: true, message: "Ownership transferred successfully." }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "SUBREDDIT_OWNERSHIP_TRANSFER_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
