import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

// Creator Route: Add a flair template selection option to a community
export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { subredditId, text, backgroundColor, textColor } = await req.json();
    if (!subredditId || !text || text.trim().length === 0) {
      return NextResponse.json({ message: "Missing payload variables." }, { status: 422 });
    }

    const sub = await db.subreddit.findUnique({ where: { id: subredditId } });
    if (!sub || sub.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: Mod access required." }, { status: 403 });
    }

    await db.userFlair.create({
      data: { subredditId, text: text.trim(), backgroundColor: backgroundColor || "#f3f4f6", textColor: textColor || "#1f2937" }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}

// Member Route: Assign an active flair selection string to a user subscription row
export async function PATCH(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { subredditId, flairText } = await req.json();

    await db.subscription.update({
      where: { userId_subredditId: { userId: session.user.id, subredditId } },
      data: { selectedFlair: flairText || "" }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}