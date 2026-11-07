import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { connection } from "next/server";

// Instantiate a persistent global dictionary layer to manage volatile audio handshake signaling frames
const audioSignalingCache = (global as Record<string, unknown>)._audioSignalingCache || 
  ((global as Record<string, unknown>)._audioSignalingCache = new Map<string, string>());

const getCache = (): Map<string, string> => audioSignalingCache as Map<string, string>;

export async function GET(req: Request) {
  try {
    await connection();
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");

    if (!spaceId) {
      return NextResponse.json({ sdpOffer: null }, { status: 422 });
    }

    const cachedOffer = getCache().get(`audio_offer:${spaceId}`);
    return NextResponse.json({ sdpOffer: cachedOffer || null }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ sdpOffer: null }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, code: "UNAUTHORIZED_ACTION" }, { status: 401 });

    const { subredditId, title, sdpOffer, spaceId, sdpAnswer, type } = await req.json();

    // 1. Broadcaster Audio Space Initialization Pass
    if (type === "INIT_TALK") {
      if (!subredditId || !title?.trim() || !sdpOffer) {
        return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });
      }

      const newSpace = await db.liveAudioSpace.create({
        data: { title: title.trim(), status: "OPEN", sdpOffer, subredditId, hostId: session.user.id }
      });

      getCache().set(`audio_offer:${newSpace.id}`, sdpOffer);
      return NextResponse.json({ success: true, spaceId: newSpace.id }, { status: 201 });
    }

    // 2. Audience Listener Audio Handshake Connect Pass
    if (type === "SUBMIT_TALK_ANSWER") {
      if (!spaceId || !sdpAnswer) return NextResponse.json({ success: false, code: "MISSING_PAYLOAD" }, { status: 422 });

      getCache().set(`audio_answer:${spaceId}`, sdpAnswer);
      
      await db.liveAudioSpace.update({
        where: { id: spaceId },
        data: { sdpAnswer, listenerCount: { increment: 1 } }
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false, code: "INVALID_ACTION" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, code: "SERVER_CRASH" }, { status: 500 });
  }
}
