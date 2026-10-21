import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { promises as fs } from "fs";
import path from "path";
import { connection } from "next/server";

export async function PATCH(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { displayName, bio, file } = await req.json();
    let finalImageUrl: string | undefined = undefined;

    // Process binary graphics storage paths if a fresh selection is sent by the client
    if (file && file.base64Data) {
      const strategy = process.env.STORAGE_STRATEGY || "LOCAL";
      const buffer = Buffer.from(file.base64Data.split(",")[1], "base64");

      if (strategy === "LOCAL") {
        const uploadDir = path.join(process.cwd(), "public", "avatars");
        await fs.mkdir(uploadDir, { recursive: true });
        const fileName = `${session.user.id}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        await fs.writeFile(path.join(uploadDir, fileName), buffer);
        finalImageUrl = `/avatars/${fileName}`;
      }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
        bio: bio !== undefined ? bio : undefined,
        image: finalImageUrl ? finalImageUrl : undefined,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "USER_PROFILE_PATCH_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
