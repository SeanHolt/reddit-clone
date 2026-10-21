import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, text } = await req.json();

    if (!text || text.trim().length === 0 || text.length > 1000) {
      return NextResponse.json({ message: "Message must be 1-1000 characters." }, { status: 422 });
    }

    if (!receiverId || receiverId === session.user.id) {
      return NextResponse.json({ message: "Invalid target recipient." }, { status: 422 });
    }

    // Atomically create the private conversation log entry inside SQLite
    const msg = await db.directMessage.create({
      data: {
        text: text.trim(),
        senderId: session.user.id,
        receiverId,
      },
    });

    return NextResponse.json({ messageId: msg.id }, { status: 201 });
  } catch (error: unknown) {
    logServerError(error, "DIRECT_MESSAGE_POST_API");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
