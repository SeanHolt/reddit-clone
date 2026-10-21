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
    const subredditId = searchParams.get("subredditId");
    const limit = 10;

    interface WhereClause { subredditId?: string | { in: string[] }; }
    const whereClause: WhereClause = {};
    
    if (subredditId) {
      whereClause.subredditId = subredditId;
    } else if (feedType === "home" && session?.user?.id) {
      const subscriptions = await db.subscription.findMany({
        where: { userId: session.user.id },
        select: { subredditId: true },
      });
      whereClause.subredditId = { in: subscriptions.map((s) => s.subredditId) };
    }

    const rawPosts = await db.post.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, username: true, displayName: true, image: true } },
        subreddit: { select: { id: true, name: true, accentColor: true, autoModKeywords: true } },
        votes: { select: { id: true, type: true, userId: true, postId: true } },
        media: { select: { id: true, url: true } },
        _count: { select: { comments: true, views: true } }
      },
    }) as unknown as PostWithRelations[];

    const { calculateHotScore } = await import("@/lib/algorithms");
    const sortedPosts = [...rawPosts].sort((a, b) => calculateHotScore(b) - calculateHotScore(a));

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
