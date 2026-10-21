import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function GET(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");
    const lastTimestamp = searchParams.get("after");

    if (!partnerId || !lastTimestamp) {
      return NextResponse.json({ message: "Missing syncing parameters." }, { status: 422 });
    }

    // Fetch incoming messages created after the client's last known timestamp window
    const rawNewDMs = await db.directMessage.findMany({
      where: {
        senderId: partnerId,
        receiverId: session.user.id,
        createdAt: {
          gt: new Date(lastTimestamp),
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const newMessages = rawNewDMs.map((dm) => ({
      id: dm.id,
      text: dm.text,
      senderId: dm.senderId,
      receiverId: dm.receiverId,
      createdAt: dm.createdAt.toISOString(),
    }));

    return NextResponse.json(newMessages, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "CHAT_POLLING_SYNC_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}