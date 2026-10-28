import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

// Instantiate a persistent global dictionary layer to manage volatile WebRTC handshake signaling frames
const signalingCache = (global as any)._webrtcSignalingCache || ((global as any)._webrtcSignalingCache = new Map<string, string>());

export async function GET(req: Request) {
  try {
    await connection();
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json({ sdpOffer: null }, { status: 422 });
    }

    // Pull the active WebRTC SDP offer string description from our volatile memory registry cache
    const cachedOffer = signalingCache.get(`offer:${streamId}`);

    return NextResponse.json({ sdpOffer: cachedOffer || null }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ sdpOffer: null }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false }, { status: 401 });

    const { subredditId, title, sdpOffer, streamId, sdpAnswer, type } = await req.json();

    // 1. Broadcaster Handshake Init Pipeline Pass
    if (type === "INIT_BROADCAST") {
      if (!subredditId || !title?.trim() || !sdpOffer) {
        return NextResponse.json({ success: false }, { status: 422 });
      }

      const newStream = await db.liveStream.create({
        data: { title: title.trim(), status: "STREAMING", sdpOffer, subredditId, streamerId: session.user.id }
      });

      signalingCache.set(`offer:${newStream.id}`, sdpOffer);
      return NextResponse.json({ success: true, streamId: newStream.id }, { status: 201 });
    }

    // 2. Audience Consumer Handshake Answer Pipeline Pass
    if (type === "SUBMIT_ANSWER") {
      if (!streamId || !sdpAnswer) return NextResponse.json({ success: false }, { status: 422 });

      signalingCache.set(`answer:${streamId}`, sdpAnswer);
      
      await db.liveStream.update({
        where: { id: streamId },
        data: { sdpAnswer, viewerCount: { increment: 1 } }
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
