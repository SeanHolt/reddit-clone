import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 401 });

    const { subredditId, federationName } = await req.json();
    if (!subredditId || !federationName?.trim()) {
      return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });
    }

    // 1. Authorization Gate: Verify that the executing user is the true creator of the subreddit
    const subreddit = await db.subreddit.findUnique({
      where: { id: subredditId }
    });
    if (!subreddit || subreddit.creatorId !== session.user.id) {
      return NextResponse.json({ success: false, code: "AUTOMOD_BLOCKED" }, { status: 403 });
    }

    // 2. Locate or create the targeted federation network ledger row atomically
    const federation = await db.federation.upsert({
      where: { name: federationName.trim() },
      update: {},
      create: { name: federationName.trim(), description: "Allied network of subreddits" }
    });

    // 3. Establish the secure alliance join table link record
    await db.subredditFederation.upsert({
      where: { federationId_subredditId: { federationId: federation.id, subredditId } },
      update: {},
      create: { federationId: federation.id, subredditId, status: "ACTIVE" }
    });

    return NextResponse.json({ success: true, federationId: federation.id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, code: "SERVER_CRASH" }, { status: 500 });
  }
}
