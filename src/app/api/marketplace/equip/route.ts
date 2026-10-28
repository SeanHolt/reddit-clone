import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { assetId } = await req.json();
    if (!assetId) return NextResponse.json({ success: false }, { status: 422 });

    const asset = await db.userAsset.findUnique({
      where: { id: assetId, userId: session.user.id },
      include: { item: true }
    });
    if (!asset) return NextResponse.json({ success: false }, { status: 404 });

    const targetToggleState = !asset.isEquipped;

    await db.$transaction(async (tx) => {
      if (targetToggleState) {
        // Automatically un-equip any other active items within the exact same category
        await tx.userAsset.updateMany({
          where: { userId: session.user.id, item: { assetType: asset.item.assetType } },
          data: { isEquipped: false }
        });
      }

      // Commit the updated equipment toggle state
      await tx.userAsset.update({
        where: { id: assetId },
        data: { isEquipped: targetToggleState }
      });
    });

    return NextResponse.json({ success: true, isEquipped: targetToggleState }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
