import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function GET(req: Request) {
  try {
    await connection();
    const { searchParams } = new URL(req.url);
    const subredditId = searchParams.get("subredditId");

    if (!subredditId) {
      return NextResponse.json([], { status: 200 });
    }

    // Safely execute the lookup directly inside our secure node runtime environment
    const tags = await db.communityTag.findMany({
      where: { subredditId },
      select: { id: true, label: true, bgHex: true }
    });

    return NextResponse.json(tags, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
