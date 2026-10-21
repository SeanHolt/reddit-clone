import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { promises as fs } from "fs";
import path from "path";
import { processMentions } from "@/lib/mentions";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      !session.user.username ||
      session.user.username.startsWith("user_")
    ) {
      return NextResponse.json(
        { message: "Forbidden: Claim a valid handle before posting." },
        { status: 403 },
      );
    }

    const { title, content, files, subredditId } = await req.json();
    if (
      !title ||
      title.trim().length < 3 ||
      title.length > 100 ||
      !subredditId
    ) {
      return NextResponse.json(
        { message: "Invalid parameters." },
        { status: 422 },
      );
    }

    const targetSubreddit = await db.subreddit.findUnique({
      where: { id: subredditId },
      select: {
        id: true,
        name: true,
        autoModKeywords: true,
        minKarmaRequired: true,
        minAccountAgeDays: true,
      },
    });

    if (!targetSubreddit)
      return NextResponse.json(
        { message: "Community not found." },
        { status: 404 },
      );

    const strategy = process.env.STORAGE_STRATEGY || "LOCAL";
    interface UnifiedMediaItem {
      url: string;
      bytes?: Buffer;
    }
    const mediaItems: UnifiedMediaItem[] = [];
    const uploadedFiles = Array.isArray(files) ? files : [];

    for (const file of uploadedFiles) {
      const { name, base64Data } = file;
      const buffer = Buffer.from(
        base64Data.split(",")[1] || base64Data,
        "base64",
      );

      if (strategy === "DATABASE") {
        mediaItems.push({ url: `/api/media/db-placeholder`, bytes: buffer });
      } else {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}-${name.replace(/\s+/g, "-")}`;
        await fs.writeFile(path.join(uploadDir, fileName), buffer);
        mediaItems.push({ url: `/uploads/${fileName}` });
      }
    }

    const post = await db.post.create({
      data: {
        title: title.trim(),
        content: content?.trim() || null,
        subredditId,
        authorId: session.user.id,
        media: {
          create: mediaItems.map((item) => ({
            url: item.url,
            // FIXED: Explicitly wrap the buffer into a standard Uint8Array primitive to align schema types
            bytes: item.bytes ? new Uint8Array(item.bytes) : undefined,
          })),
        },
      },
    });
    if (content) {
      // Fire it safely without using 'await' if you want to prevent blocking the client return paint
      processMentions({
        text: content,
        postId: post.id,
        authorId: session.user.id,
        sourceType: "POST",
      }).catch((err) => console.error("MENTION_PROG_ERR:", err));
    }

    return NextResponse.json({ postId: post.id }, { status: 201 });
  } catch (error: unknown) {
    logServerError(error, "POST_CREATION_API_CRASH");
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 },
    );
  }
}
