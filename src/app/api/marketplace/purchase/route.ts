import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { modifyUserWallet } from "@/lib/economy";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 401 });

    const { itemId } = await req.json();
    if (!itemId) return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });

    const targetItem = await db.marketplaceItem.findUnique({
      where: { id: itemId, isActive: true }
    });
    if (!targetItem) return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 404 });

    // 1. Guard Rail: Verify if the user already holds this asset in their inventory
    const alreadyOwned = await db.userAsset.findUnique({
      where: { userId_itemId: { userId: session.user.id, itemId } }
    });
    if (alreadyOwned) return NextResponse.json({ success: false, code: "AUTOMOD_BLOCKED" }, { status: 400 });

    // 2. Execute transactional currency transfers and asset minting atomically inside SQLite
    try {
      await db.$transaction(async (tx) => {
        // Debit funds from the buyer's wallet ledger wrapper
        await modifyUserWallet({
          userId: session.user.id,
          amount: -targetItem.price,
          transactionType: `MARKETPLACE_BUY_${targetItem.assetType}`,
        });

        // Credit 80% of the sale revenue straight back to the original item creator as a royalty
        await modifyUserWallet({
          userId: targetItem.creatorId,
          amount: Math.floor(targetItem.price * 0.8),
          transactionType: `MARKETPLACE_ROYALTY_EARNED`,
        });

        // Mint the single unique instance inventory asset row token
        await tx.userAsset.create({
          data: { userId: session.user.id, itemId }
        });
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INSUFFICIENT_FUNDS") {
        return NextResponse.json({ success: false, code: "RESTRICTION_GATE_KARMA" }, { status: 402 });
      }
      throw err;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, code: "SERVER_CRASH" }, { status: 500 });
  }
}
