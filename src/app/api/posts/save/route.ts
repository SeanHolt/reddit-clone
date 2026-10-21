import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ message: "Missing post ID." }, { status: 422 });

    const existingSave = await db.savedPost.findUnique({
      where: { userId_postId: { userId: session.user.id, postId } }
    });

    if (existingSave) {
      await db.savedPost.delete({ where: { id: existingSave.id } });
      return NextResponse.json({ saved: false }, { status: 200 });
    }

    await db.savedPost.create({ data: { userId: session.user.id, postId } });
    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
