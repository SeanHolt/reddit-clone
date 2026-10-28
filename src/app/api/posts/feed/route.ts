import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";
import { PostWithRelations } from "@/types/db";

export async function GET(req: Request) {
  try {
    await connection();
    const session = await auth();
    const { searchParams } = new URL(req.url);
    
    const cursor = searchParams.get("cursor");
    const feedType = searchParams.get("feed") || "popular";
    const subredditId = searchParams.get("subredditId") || undefined;
    const limit = 10;

    const matchFilters: {
      subredditId?: string | { in: string[] };
      author?: { OR: [{ isShadowBanned: false }, { id: string }] | [{ isShadowBanned: false }] };
    } = {};

    if (subredditId) {
      matchFilters.subredditId = subredditId;
    } else if (feedType === "home" && session?.user?.id) {
      const subs = await db.subscription.findMany({
        where: { userId: session.user.id },
        select: { subredditId: true },
      });
      matchFilters.subredditId = { in: subs.map((s) => s.subredditId) };
    }

    matchFilters.author = session?.user?.id 
      ? { OR: [{ isShadowBanned: false }, { id: session.user.id }] }
      : { OR: [{ isShadowBanned: false }] };

    // FIXED: Pristine, type-safe explicit include dictionary layer across all relevant models
    const rawPosts = (await db.post.findMany({
      where: matchFilters,
      include: {
        author: { select: { id: true, username: true, displayName: true, image: true, isShadowBanned: true } },
        subreddit: {
          include: {
            customEmojis: { select: { shortcode: true, base64Data: true } }
          }
        },
        votes: { select: { id: true, type: true, userId: true, postId: true } },
        media: { select: { id: true, url: true } },
        reports: { select: { id: true } },
        pollOptions: {
          include: {
            votes: { select: { userId: true } }
          }
        },
        _count: { select: { comments: true, views: true } }
      },
    })) as unknown as PostWithRelations[];
    console.log("DEBUG: Retrieved raw posts from database:", rawPosts);
    const verifiedPosts = rawPosts.filter((post) => {
      const reportsCount = post.reports?.length || 0;
      const threshold = post.subreddit?.autoRemoveThreshold ?? 5;
      if (reportsCount >= threshold && post.authorId !== session?.user?.id) return false;
      return true;
    });

    const { calculateHotScore } = await import("@/lib/algorithms");
    const sortedPosts = [...verifiedPosts].sort((a, b) => calculateHotScore(b) - calculateHotScore(a));

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = sortedPosts.findIndex((p) => p.id === cursor);
      if (cursorIndex !== -1) startIndex = cursorIndex + 1;
    }

    const slicedItems = sortedPosts.slice(startIndex, startIndex + limit);
    const hasNextPage = sortedPosts.length > startIndex + limit;
    const nextCursor = hasNextPage ? slicedItems[slicedItems.length - 1].id : null;

    return NextResponse.json({ items: slicedItems, nextCursor }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "FEED_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
