import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function GET(req: Request) {
  try {
    // Safely enforce dynamic request-bound execution under Cache Components
    await connection();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json([], { status: 200 });
    }

    const cleanedQuery = query.trim();

    // Query SQLite to scan both titles AND markdown contents simultaneously
    const posts = await db.post.findMany({
      where: {
        OR: [
          { title: { contains: cleanedQuery } },
          { content: { contains: cleanedQuery } }
        ]
      },
      include: {
        author: true,
        subreddit: true,
        votes: true,
        _count: { select: { comments: true } }
      },
      take: 20,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "POST_FEED_SEARCH_API");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
