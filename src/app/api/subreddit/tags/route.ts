import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { subredditId, label, bgHex, textHex } = await req.json();
    if (!subredditId || !label?.trim()) {
      return NextResponse.json({ message: "Missing required text parameters." }, { status: 422 });
    }

    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Mod access required." }, { status: 403 });
    }

    const newTag = await db.communityTag.create({
      data: {
        subredditId,
        label: label.trim(),
        bgHex: bgHex || "#f3f4f6",
        textHex: textHex || "#1f2937",
      },
    });

    return NextResponse.json({ success: true, tagId: newTag.id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
