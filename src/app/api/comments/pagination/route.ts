import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function GET(req: Request) {
  try {
    await connection();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor") || undefined;
    const limit = 15;

    if (!postId) {
      return NextResponse.json(
        { items: [], nextCursor: null },
        { status: 422 },
      );
    }

    // Use Prisma's strict cursor configuration schema to offset database row slices safely
    const comments = await db.comment.findMany({
      where: { postId },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        // FIXED: Shifted from select to include to allow nested model relationship queries on the User block layout [1.1]
        author: {
          include: {
            inventory: {
              where: { isEquipped: true },
              include: {
                item: {
                  select: { assetType: true, styleValue: true },
                },
              },
            },
          },
        },
        votes: { select: { id: true, type: true, userId: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const nextCursor =
      comments.length === limit ? comments[comments.length - 1].id : null;

    return NextResponse.json({ items: comments, nextCursor }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ items: [], nextCursor: null }, { status: 500 });
  }
}
