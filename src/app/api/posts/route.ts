import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (
      !session?.user?.id ||
      !session.user.username ||
      session.user.username.startsWith("user_")
    ) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED_ACTION" },
        { status: 403 },
      );
    }

    const { title, content, files, subredditId, postType, pollOptions, tagId } =
      await req.json();

    if (
      !title ||
      title.trim().length < 3 ||
      title.length > 100 ||
      !subredditId
    ) {
      return NextResponse.json(
        { success: false, code: "MISSING_PAYLOAD" },
        { status: 422 },
      );
    }

    // 1. Fetch community details to verify restriction gates
    const targetSubreddit = await db.subreddit.findUnique({
      where: { id: subredditId },
      select: {
        id: true,
        name: true,
        isLocked: true,
        autoModKeywords: true,
        minKarmaRequired: true,
        minAccountAgeDays: true,
      },
    });

    if (!targetSubreddit) {
      return NextResponse.json(
        { success: false, code: "MISSING_PAYLOAD" },
        { status: 404 },
      );
    }
    if (targetSubreddit.isLocked) {
      return NextResponse.json(
        { success: false, code: "SUBREDDIT_LOCKED" },
        { status: 423 },
      );
    }

    // 2. User Ban Enforcement Gate
    const activeBan = await db.moderationAction.findUnique({
      where: { userId_subredditId: { userId: session.user.id, subredditId } },
    });

    if (
      activeBan &&
      (!activeBan.expiresAt || activeBan.expiresAt > new Date())
    ) {
      return NextResponse.json(
        { success: false, code: "USER_BANNED" },
        { status: 403 },
      );
    }

    // 3. AutoMod Keyword Interceptor
    if (targetSubreddit.autoModKeywords) {
      const prohibitedTerms = targetSubreddit.autoModKeywords.split(",");
      const scanText = `${title} ${content || ""}`.toLowerCase();
      if (prohibitedTerms.some((term) => scanText.includes(term))) {
        return NextResponse.json(
          { success: false, code: "AUTOMOD_BLOCKED" },
          { status: 400 },
        );
      }
    }
    // 4. Age and Karma restriction gates validation checks
    const authorTotalKarma =
      (session.user.postKarma || 0) + (session.user.commentKarma || 0);
    if (authorTotalKarma < targetSubreddit.minKarmaRequired) {
      return NextResponse.json(
        { success: false, code: "RESTRICTION_GATE_KARMA" },
        { status: 403 },
      );
    }

    if (targetSubreddit.minAccountAgeDays > 0) {
      const userRecord = await db.user.findUnique({
        where: { id: session.user.id },
        select: { createdAt: true },
      });
      if (userRecord) {
        const accountAgeDays =
          (Date.now() - new Date(userRecord.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        if (accountAgeDays < targetSubreddit.minAccountAgeDays) {
          return NextResponse.json(
            { success: false, code: "RESTRICTION_GATE_AGE" },
            { status: 403 },
          );
        }
      }
    }

    // 5. Multi-Strategy Media Attachment Storage Processor
    const strategy = process.env.STORAGE_STRATEGY || "LOCAL";
    interface UnifiedMediaItem {
      url: string;
      bytes?: Buffer;
    }
    const mediaItems: UnifiedMediaItem[] = [];
    const uploadedFiles = Array.isArray(files) ? files : [];

    for (const file of uploadedFiles) {
      const { name, base64Data } = file;
      const buffer = Buffer.from(base64Data.split(",") || base64Data, "base64");

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

    // 6. RESTORED: Unified Post and Relational Poll Option transactional commits
    const validOptions = Array.isArray(pollOptions)
      ? pollOptions.map((o: string) => o.trim()).filter(Boolean)
      : [];

    const post = await db.post.create({
      data: {
        title: title.trim(),
        content: postType === "TEXT" ? content?.trim() || null : null,
        subredditId,
        authorId: session.user.id,
        media: {
          create: mediaItems.map((item) => ({
            url: item.url,
            bytes: item.bytes ? new Uint8Array(item.bytes) : undefined,
          })),
        },
        pollOptions:
          postType === "POLL"
            ? {
                create: validOptions.map((optText) => ({ text: optText })),
              }
            : undefined,

        // FIXED: Explicitly attach the moderator-created community tag relation if selected
        tags: tagId
          ? {
              connect: { id: tagId },
            }
          : undefined,
      },
    });

    if (content) {
      const { processMentions } = await import("@/lib/mentions");
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
      { success: false, code: "SERVER_CRASH" },
      { status: 500 },
    );
  }
}
