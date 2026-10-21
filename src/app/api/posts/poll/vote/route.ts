import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { optionId, postId } = await req.json();
    if (!optionId || !postId) {
      return NextResponse.json({ message: "Missing payload tokens." }, { status: 422 });
    }

    // 1. Flush any historical votes this user previously placed on options within this exact post
    const existingOptions = await db.pollOption.findMany({ where: { postId }, select: { id: true } });
    const optionIds = existingOptions.map((o) => o.id);

    await db.pollVote.deleteMany({
      where: { userId: session.user.id, optionId: { in: optionIds } }
    });

    // 2. Commit the new clean poll vote selection row entry inside SQLite
    await db.pollVote.create({
      data: { userId: session.user.id, optionId }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    logServerError(error, "POLL_VOTING_TRANSACTION_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
