import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { subredditId, description } = await req.json();

    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden. You are not the moderator." }, { status: 403 });
    }

    await db.subreddit.update({
      where: { id: subredditId },
      data: { description: description?.trim() || null },
    });

    return NextResponse.json({ message: "Subreddit configuration updated." }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "SUBREDDIT_MOD_PATCH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { postId } = await req.json();

    const post = await db.post.findUnique({
       where: { id: postId },
      include: { subreddit: true },
    });

    if (!post || post.subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden. Action requires moderator privileges." }, { status: 403 });
    }

    await db.post.delete({ where: { id: postId } });
    return NextResponse.json({ message: "Post deleted successfully." }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "SUBREDDIT_MOD_DELETE");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
