import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Jury Eligibility Gate: Restrict voting privileges strictly to high-karma accounts
    const totalKarma = (session.user.postKarma || 0) + (session.user.commentKarma || 0);
    if (totalKarma < 500) {
      return NextResponse.json({ message: "Forbidden: 500 karma required to serve on tribunals." }, { status: 403 });
    }

    const { caseId, voteType } = await req.json();
    if (!caseId || (voteType !== "UPHOLD" && voteType !== "OVERTURN")) {
      return NextResponse.json({ message: "Invalid payload parameters." }, { status: 422 });
    }

    const activeCase = await db.appealCase.findUnique({
      where: { id: caseId, status: "PENDING" },
      include: { action: true }
    });
    if (!activeCase) return NextResponse.json({ message: "Case not available or already resolved." }, { status: 404 });
    if (activeCase.userId === session.user.id) return NextResponse.json({ message: "You cannot vote on your own appeal." }, { status: 422 });

    // 1. Transactionally log the vote and check for case resolution thresholds
    await db.$transaction(async (tx) => {
      await tx.juryVote.create({ data: { caseId, jurorId: session.user.id, type: voteType } });

      const allVotes = await tx.juryVote.findMany({ where: { caseId } });
      
      if (allVotes.length >= 5) {
        const upholds = allVotes.filter(v => v.type === "UPHOLD").length;
        const finalStatus = upholds >= 3 ? "UPHELD" : "OVERTURNED";

        await tx.appealCase.update({ where: { id: caseId }, data: { status: finalStatus } });

        // If the jury votes to overturn the ban, delete the active ModerationAction row
        if (finalStatus === "OVERTURNED") {
          await tx.moderationAction.delete({ where: { id: activeCase.actionId } });
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
