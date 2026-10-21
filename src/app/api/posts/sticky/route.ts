import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ message: "Missing post ID." }, { status: 422 });

    const post = await db.post.findUnique({
      where: { id: postId },
      include: { subreddit: true },
    });

    if (!post) return NextResponse.json({ message: "Post not found." }, { status: 404 });
    if (post.subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Only community creators can stick posts." }, { status: 403 });
    }

    if (!post.isSticky) {
      const stickyCount = await db.post.count({
        where: { subredditId: post.subredditId, isSticky: true },
      });
      if (stickyCount >= 2) {
        return NextResponse.json({ message: "You can only pin a maximum of 2 posts per community." }, { status: 422 });
      }
    }

    await db.post.update({
      where: { id: postId },
      data: { isSticky: !post.isSticky },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "POST_STICKY_TOGGLE_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}