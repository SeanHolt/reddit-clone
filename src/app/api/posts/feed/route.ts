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

    const matchFilters: Record<string, unknown> = {};

    if (feedType === "FEDERATION" && subredditId) {
      // 1. Locate all active sister communities linked to the same federation network alliance
      const alliances = await db.subredditFederation.findMany({
        where: {
          status: "ACTIVE",
          federation: {
            alliances: { some: { subredditId } },
          },
        },
        select: { subredditId: true },
      });

      const alliedSubredditIds = Array.from(
        new Set([subredditId, ...alliances.map((a) => a.subredditId)]),
      );

      // 2. Expand filters to pull post rows from all allied communities atomically
      matchFilters.subredditId = { in: alliedSubredditIds };
    } else if (subredditId) {
      matchFilters.subredditId = subredditId;
    }

    matchFilters.author = session?.user?.id
      ? { OR: [{ isShadowBanned: false }, { id: session.user.id }] }
      : { OR: [{ isShadowBanned: false }] };

    // FIXED: Pristine, type-safe explicit include dictionary layer across all relevant models
    const rawPosts = (await db.post.findMany({
      where: matchFilters,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
            isShadowBanned: true,
            // FIXED: Fetch localized subreddit progress data fields natively in the core feed query
            subredditProgress: {
              select: { subredditId: true, level: true },
            },
          },
        },
        subreddit: {
          include: {
            customEmojis: { select: { shortcode: true, base64Data: true } },
          },
        },
        votes: { select: { id: true, type: true, userId: true, postId: true } },
        media: { select: { id: true, url: true } },
        reports: { select: { id: true } },
        postAwards: { select: { id: true, awardType: true } },
        pollOptions: { include: { votes: { select: { userId: true } } } },
        _count: { select: { comments: true, views: true } },
      },
    })) as unknown as PostWithRelations[];
    console.log("DEBUG: Retrieved raw posts from database:", rawPosts);
    const verifiedPosts = rawPosts.filter((post) => {
      const reportsCount = post.reports?.length || 0;
      const threshold = post.subreddit?.autoRemoveThreshold ?? 5;
      if (reportsCount >= threshold && post.authorId !== session?.user?.id)
        return false;
      return true;
    });

    const { calculateHotScore } = await import("@/lib/algorithms");
    const sortedPosts = [...verifiedPosts].sort(
      (a, b) => calculateHotScore(b) - calculateHotScore(a),
    );

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = sortedPosts.findIndex((p) => p.id === cursor);
      if (cursorIndex !== -1) startIndex = cursorIndex + 1;
    }

    const slicedItems = sortedPosts.slice(startIndex, startIndex + limit);
    const hasNextPage = sortedPosts.length > startIndex + limit;
    const nextCursor = hasNextPage
      ? slicedItems[slicedItems.length - 1].id
      : null;

    return NextResponse.json(
      { items: slicedItems, nextCursor },
      { status: 200 },
    );
  } catch (error: unknown) {
    logServerError(error, "FEED_API_CRASH");
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 },
    );
  }
}
