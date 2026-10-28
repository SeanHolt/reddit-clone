import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";
import { dispatchModAuditLog } from "@/lib/audit-logger";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 401 });
    }

    const { subredditId, isLocked, autoRemoveThreshold } = await req.json();
    if (!subredditId || isLocked === undefined || autoRemoveThreshold === undefined) {
      return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });
    }

    const subreddit = await db.subreddit.findUnique({
      where: { id: subredditId },
      select: { creatorId: true },
    });

    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 403 });
    }

    await db.subreddit.update({
      where: { id: subredditId },
      data: {
        isLocked,
        autoRemoveThreshold: Math.max(1, parseInt(autoRemoveThreshold, 10) || 5),
      },
    });
    dispatchModAuditLog({
      subredditId,
      moderatorId: session.user.id,
      actionType: "LOCKDOWN_TOGGLE",
      details: `Altered community state to ${isLocked ? "LOCKED" : "OPEN"} mode. Configured auto-remove flag count threshold bound to ${autoRemoveThreshold} flags.`,
    }).catch((err) => console.error(err));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, code: "SERVER_CRASH" }, { status: 500 });
  }
}
