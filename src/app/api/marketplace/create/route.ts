import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 401 });
    }

    const { title, description, assetType, styleValue, price } = await req.json();
    if (!title?.trim() || !assetType || !styleValue?.trim() || !price) {
      return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });
    }

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice < 10 || parsedPrice > 5000) {
      return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });
    }

    // Insert the new asset row securely into the marketplace registry table
    const newItem = await db.marketplaceItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        assetType,
        styleValue: styleValue.trim(),
        price: parsedPrice,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, itemId: newItem.id }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, code: "SERVER_CRASH" }, { status: 500 });
  }
}
