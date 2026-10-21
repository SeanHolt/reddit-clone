import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

export async function GET(req: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  try {
    const { mediaId } = await params;

    const media = await db.postMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media || !media.bytes) {
      return new NextResponse("Image asset not found.", { status: 404 });
    }

    // Stream raw binary byte buffers directly back to the browser cache
    return new NextResponse(media.bytes, {
      headers: {
        "Content-Type": "image/png", // Adjust dynamically based on requirements
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    logServerError(error, "DATABASE_MEDIA_STREAM_API_CRASH");
    return new NextResponse("Internal Server Error.", { status: 500 });
  }
}