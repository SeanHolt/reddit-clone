import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 401 });

    const { actionId, subredditId, reason } = await req.json();
    if (!actionId || !subredditId || !reason?.trim()) {
      return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });
    }

    // 1. Guard against duplicate appeal submissions
    const duplicateCase = await db.appealCase.findUnique({ where: { actionId } });
    if (duplicateCase) {
      return NextResponse.json({ success: false, code: "AUTOMOD_BLOCKED" }, { status: 400 }); 
    }

    // 2. Commit the new appeal case to the database
    const newCase = await db.appealCase.create({
      data: {
        actionId,
        subredditId,
        userId: session.user.id,
        reason: reason.trim(),
      },
    });

    return NextResponse.json({ success: true, caseId: newCase.id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, code: "SERVER_CRASH" }, { status: 500 });
  }
}
