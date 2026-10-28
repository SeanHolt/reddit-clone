import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connection } from "next/server";

// Initialize a persistent in-memory global state cache map dictionary securely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalTypingCache = (global as any)._typingCache || ((global as any)._typingCache = new Map<string, number>());

export async function GET(req: Request) {
  try {
    await connection();
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");
    const channelId = searchParams.get("channelId"); // Unique combined identifier string
    
    if (!partnerId || !channelId) {
      return NextResponse.json({ isTyping: false }, { status: 200 });
    }

    const lastTypedTimestamp = globalTypingCache.get(`${partnerId}:${channelId}`);
    
    // If the partner's last tracked keystroke occurred within the past 4 seconds, flag them as typing
    if (lastTypedTimestamp && Date.now() - lastTypedTimestamp < 4000) {
      return NextResponse.json({ isTyping: true }, { status: 200 });
    }

    return NextResponse.json({ isTyping: false }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ isTyping: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { receiverId, channelId } = await req.json();
    if (!receiverId || !channelId) return NextResponse.json({ success: false }, { status: 422 });

    // Store the active user session ID paired against the combined channel string layout keys
    globalTypingCache.set(`${session.user.id}:${channelId}`, Date.now());

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
