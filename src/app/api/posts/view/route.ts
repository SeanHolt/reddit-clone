import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();

    // Anonymous views pass quietly without throwing a hard API crash block
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Guest view logged" }, { status: 200 });
    }

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ message: "Missing post ID." }, { status: 422 });

    // Transactionally track the unique user view impression inside SQLite rows
    await db.postView.upsert({
      where: { userId_postId: { userId: session.user.id, postId } },
      update: {}, // No-op if impression record already exists for this profile match
      create: { userId: session.user.id, postId },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    logServerError(error, "POST_IMPRESSION_VIEW_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}