import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function GET(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return NextResponse.json({ message: "Missing post ID." }, { status: 422 });

    const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post || post.authorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Access denied." }, { status: 403 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch view nodes and share click nodes simultaneously
    const views = await db.postView.findMany({ where: { postId, createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } });
    const clicks = await db.shareClick.findMany({ where: { postId, createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } });

    const viewCounts = Array(7).fill(0);
    const clickCounts = Array(7).fill(0);
    const now = new Date();

    const bucketTime = (createdAt: Date, countsArr: number[]) => {
      const diffDays = Math.floor(Math.abs(now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) countsArr[6 - diffDays]++;
    };

    views.forEach((v) => bucketTime(v.createdAt, viewCounts));
    clicks.forEach((c) => bucketTime(c.createdAt, clickCounts));

    return NextResponse.json({ viewCounts, clickCounts }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
