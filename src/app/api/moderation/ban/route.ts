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

    const { username, subredditId, type, durationDays, reason } = await req.json();
    if (!username || !subredditId || !["BAN", "TIMEOUT"].includes(type)) {
      return NextResponse.json({ message: "Invalid payload parameters." }, { status: 422 });
    }

    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You are not a moderator here." }, { status: 403 });
    }

    const targetUser = await db.user.findUnique({ where: { username } });
    if (!targetUser) return NextResponse.json({ message: "Target user not found." }, { status: 404 });
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ message: "You cannot ban yourself." }, { status: 422 });
    }

    const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

    await db.moderationAction.upsert({
      where: { userId_subredditId: { userId: targetUser.id, subredditId } },
      update: { type, expiresAt, reason: reason?.trim() || "" },
      create: { type, expiresAt, reason: reason?.trim() || "", userId: targetUser.id, subredditId },
    });

    return NextResponse.json({ message: "User successfully moderated." }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "SUBREDDIT_BAN_API");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}