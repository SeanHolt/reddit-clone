import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { subredditId, shortcode, file } = await req.json();
    if (!subredditId || !shortcode || !file?.base64Data) {
      return NextResponse.json({ message: "Missing required asset payload tokens." }, { status: 422 });
    }

    // Verify user owns the community before writing records
    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Mod access required." }, { status: 403 });
    }

    const formattedShortcode = `:${shortcode.replace(/:/g, "").trim().toLowerCase()}:`;

    await db.customEmoji.upsert({
      where: { subredditId_shortcode: { subredditId, shortcode: formattedShortcode } },
      update: { base64Data: file.base64Data },
      create: { subredditId, shortcode: formattedShortcode, base64Data: file.base64Data },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
