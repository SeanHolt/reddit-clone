import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        
        // 1. Authenticate user session permission parameters
        if (!session?.user?.id) {
          throw new Error("Unauthorized storage pipeline token generation request.");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Callback routine executed inside the Vercel architecture once the sync completes
        console.log("BLOB_UPLOAD_SUCCESSFUL:", blob.url, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 400 }
    );
  }
}