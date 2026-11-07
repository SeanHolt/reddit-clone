import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { subredditId, targetUserId, reason } = await req.json();
    if (!subredditId || !targetUserId) return NextResponse.json({ success: false }, { status: 422 });

    // 1. Authorization Gate: Verify that the executing user moderates the origin subreddit
    const subreddit = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // 2. Locate all active federations this community belongs to
    const activeFederations = await db.subredditFederation.findMany({
      where: { subredditId, status: "ACTIVE" },
      select: { federationId: true }
    });

    if (activeFederations.length === 0) return NextResponse.json({ success: true, synced: 0 }, { status: 200 });

    // 3. Log the network ban synchronization entries atomically inside a transaction
    await db.$transaction(
      activeFederations.map((fed) =>
        db.federatedBanSync.create({
          data: {
            targetUserId,
            reason: reason?.trim() || "Automated network spam raid sync",
            federationId: fed.federationId,
            originSubId: subredditId
          }
        })
      )
    );

    return NextResponse.json({ success: true, synced: activeFederations.length }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
