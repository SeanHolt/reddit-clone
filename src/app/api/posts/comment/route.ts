import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { processMentions } from "@/lib/mentions";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { text, postId, parentId } = await req.json();
    if (!text || text.trim().length === 0 || !postId) {
      return NextResponse.json({ message: "Invalid comment parameters." }, { status: 422 });
    }

    const comment = await db.comment.create({
      data: {
        text: text.trim(),
        postId,
        parentId: parentId || null,
        authorId: session.user.id,
      },
    });
    processMentions({
      text: text,
      postId,
      authorId: session.user.id,
      sourceType: "COMMENT",
    }).catch((err) => console.error("COMMENT_MENTION_PROG_ERR:", err));

    return NextResponse.json({ commentId: comment.id }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
