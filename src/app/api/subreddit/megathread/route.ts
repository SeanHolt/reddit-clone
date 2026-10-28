import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { subredditId, title, url } = await req.json();
    if (!subredditId || !title?.trim() || !url?.trim()) {
      return NextResponse.json({ message: "Missing link parameter strings." }, { status: 422 });
    }

    // Verify user owns the community before pinning resource rows
    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Mod access required." }, { status: 403 });
    }

    const newLink = await db.megathreadLink.create({
      data: {
        subredditId,
        title: title.trim(),
        url: url.trim(),
      },
    });

    return NextResponse.json({ success: true, linkId: newLink.id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
