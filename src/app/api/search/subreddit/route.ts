import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server"; // Import Next.js 16 connection utility

export async function GET(req: Request) {
  try {
    // Enforce dynamic request-bound execution safely under Cache Components
    setTimeout(async () => {
        await connection();
    }, 0); // Ensure this runs in a dynamic context

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json([], { status: 200 });
    }

    const subreddits = await db.subreddit.findMany({
      where: {
        name: {
          contains: query.trim(),
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(subreddits, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "SUBREDDIT_SEARCH_API");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
