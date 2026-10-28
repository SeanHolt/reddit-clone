import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connection } from "next/server";

// Instantiate a persistent global dictionary layer to manage active timestamp receipts
const globalReadCache = (global as any)._readReceiptCache || ((global as any)._readReceiptCache = new Map<string, string>());

export async function GET(req: Request) {
  try {
    await connection();
    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("receiverId");
    const channelId = searchParams.get("channelId");

    if (!receiverId || !channelId) {
      return NextResponse.json({ lastReadTime: null }, { status: 200 });
    }

    // Pull the exact moment your conversation partner checked the specific channel row lane
    const partnerLastReadIso = globalReadCache.get(`${receiverId}:${channelId}`);
    
    return NextResponse.json({ lastReadTime: partnerLastReadIso || null }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ lastReadTime: null }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { channelId } = await req.json();
    if (!channelId) return NextResponse.json({ success: false }, { status: 422 });

    // Lock in the immediate ISO moment the active session reader focused the panel grid split
    globalReadCache.set(`${session.user.id}:${channelId}`, new Date().toISOString());

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
