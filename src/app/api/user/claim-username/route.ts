import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";
import { connection } from "next/server";

export async function POST(req: Request) {
  try {
    await connection();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { username } = await req.json();
    const cleanUsername = username?.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 15 || !/^[a-z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json({ message: "Invalid username handle string configuration." }, { status: 422 });
    }

    // 1. Verify that no existing active database profile already occupies this handle match index
    const exists = await db.user.findUnique({ where: { username: cleanUsername } });
    if (exists) {
      return NextResponse.json({ message: "This username is already taken." }, { status: 409 });
    }

    // 2. Commit the new unique handle path atomically to SQLite rows
    await db.user.update({
      where: { id: session.user.id },
      data: { username: cleanUsername },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logServerError(error, "CLAIM_USERNAME_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}