import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { modifyUserWallet } from "@/lib/economy";
import { PLATFORM_AWARDS, AwardTier } from "@/lib/awards-config";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 401 });
    }

    const { postId, awardType } = await req.json();
    const targetType = (awardType || "").toUpperCase() as AwardTier;
    const selectedAward = PLATFORM_AWARDS[targetType];

    if (!postId || !selectedAward) {
      return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });
    }

    const postExists = await db.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!postExists) {
      return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 404 });
    }

    // 1. Transactionally execute the coin debit check and token burn
    try {
      await modifyUserWallet({
        userId: session.user.id,
        amount: -selectedAward.cost, // Negative value handles standard wallet deduction
        transactionType: `AWARD_GIVEN_${targetType}`,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INSUFFICIENT_FUNDS") {
        return NextResponse.json({ success: false, code: "RESTRICTION_GATE_KARMA" }, { status: 402 }); // 402 Payment Required
      }
      throw err;
    }

    // 2. Commit the award creation row log inside SQLite
    const postAward = await db.postAward.create({
      data: {
        awardType: targetType,
        postId: postId,
        giverId: session.user.id,
      },
    });

    // 3. Asynchronously credit 50% of the award cost back to the content creator as an earnings bonus
    if (postExists.authorId !== session.user.id) {
      const creatorBonus = Math.floor(selectedAward.cost * 0.5);
      await modifyUserWallet({
        userId: postExists.authorId,
        amount: creatorBonus,
        transactionType: `AWARD_REWARD_RECEIVED_${targetType}`,
      }).catch((error: unknown) => console.error("CREATOR_REWARD_BONUS_FAULT:", error));
    }

    return NextResponse.json({ success: true, awardId: postAward.id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, code: "SERVER_CRASH" }, { status: 500 });
  }
}
