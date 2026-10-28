import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { targetUsername } = await req.json();
    if (!targetUsername) return NextResponse.json({ message: "Missing username parameter." }, { status: 422 });

    const targetUser = await db.user.findUnique({ where: { username: targetUsername.trim().toLowerCase() } });
    if (!targetUser) return NextResponse.json({ message: "User handle not found." }, { status: 404 });

    // Enforce administrative safety boundaries
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ message: "You cannot shadow-ban your own profile handle." }, { status: 422 });
    }

    // Toggle the boolean state atomically
    const updatedUser = await db.user.update({
      where: { id: targetUser.id },
      data: { isShadowBanned: !targetUser.isShadowBanned },
    });

    return NextResponse.json({ 
      success: true, 
      isShadowBanned: updatedUser.isShadowBanned,
      message: `Stealth shadow-ban status toggled successfully to ${updatedUser.isShadowBanned}`
    }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
