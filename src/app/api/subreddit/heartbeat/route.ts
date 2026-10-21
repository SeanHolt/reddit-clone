import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }

    const { subredditName } = await req.json();
    if (!subredditName) {
      return NextResponse.json({ message: "Subreddit name required" }, { status: 422 });
    }

    // Refresh the user's online timestamp parameters inside the database atomically
    await db.user.update({
      where: { id: session.user.id },
      data: {
        lastActiveAt: new Date(),
        activeSubredditName: subredditName,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "SUBREDDIT_HEARTBEAT_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}