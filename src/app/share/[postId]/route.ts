import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { connection } from "next/server";

interface RouteContext {
  params: Promise<{ postId: string }>;
}

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await connection();
    const { postId } = await params;

    // Locate the post and select only its minimal tracking context matrix keys
    const post = await db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        subreddit: { select: { name: true } },
      },
    });

    if (!post || !post.subreddit) {
      return new NextResponse(
        "Post or associated community timeline tracking node not found.",
        { status: 404 },
      );
    }
    await db.shareClick.create({
      data: { postId },
    });
    const redirectUrl = new URL(
      `/r/${post.subreddit.name}/comments/${post.id}`,
      req.url,
    );

    // Redirect instantly with a 307 Temporary Redirect status matrix header
    return NextResponse.redirect(redirectUrl, 307);
  } catch (error: unknown) {
    return new NextResponse("Internal Server Error Redirect Routing Fault.", {
      status: 500,
    });
  }
}
