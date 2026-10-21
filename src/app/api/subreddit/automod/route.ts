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

    const { subredditId, keywords } = await req.json();
    if (!subredditId || keywords === undefined) {
      return NextResponse.json({ message: "Missing payload parameters." }, { status: 422 });
    }

    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: You do not own this community." }, { status: 403 });
    }

    // Clean and normalize the incoming comma-separated keyword configuration
    const cleanKeywords = keywords
      .split(",")
      .map((k: string) => k.trim().toLowerCase())
      .filter((k: string) => k.length > 0)
      .join(",");

    await db.subreddit.update({
      where: { id: subredditId },
      data: { autoModKeywords: cleanKeywords },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "AUTOMOD_CONFIG_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}