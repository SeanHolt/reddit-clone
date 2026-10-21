import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { subredditId, minAccountAgeDays, minKarmaRequired } = await req.json();
    if (!subredditId || minAccountAgeDays === undefined || minKarmaRequired === undefined) {
      return NextResponse.json({ message: "Missing required payload tokens." }, { status: 422 });
    }

    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Mod access required." }, { status: 403 });
    }

    await db.subreddit.update({
      where: { id: subredditId },
      data: {
        minAccountAgeDays: Math.max(0, minAccountAgeDays),
        minKarmaRequired: Math.max(0, minKarmaRequired),
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
