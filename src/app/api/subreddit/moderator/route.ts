import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { subredditId, targetUsername, canBanUsers, canDeleteContent, canEditSettings } = await req.json();
    if (!subredditId || !targetUsername) {
      return NextResponse.json({ message: "Missing required payload values." }, { status: 422 });
    }

    // 1. Verify that the session user is the true creator/owner of the community
    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Only creators can appoint moderators." }, { status: 403 });
    }

    // 2. Locate the user account being appointed
    const targetUser = await db.user.findUnique({ where: { username: targetUsername.trim().toLowerCase() } });
    if (!targetUser) return NextResponse.json({ message: "User handle not found." }, { status: 404 });
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ message: "You are already the top-level owner." }, { status: 422 });
    }

    // 3. Upsert the moderator permissions assignment inside SQLite rows
    await db.moderatorAssignment.upsert({
      where: { userId_subredditId: { userId: targetUser.id, subredditId } },
      update: { canBanUsers, canDeleteContent, canEditSettings },
      create: { userId: targetUser.id, subredditId, canBanUsers, canDeleteContent, canEditSettings },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
