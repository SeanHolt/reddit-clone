import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username || username.length < 3 || username.length > 21 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ message: "Invalid username configuration" }, { status: 422 });
    }

    const usernameExists = await db.user.findUnique({
      where: { username },
    });

    if (usernameExists) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { username },
    });

    return NextResponse.json({ message: "Username successfully claimed" }, { status: 200 });
  } catch (error: unknown) { // Safe unknown type enforcement
    logServerError(error, "USERNAME_PATCH_API");
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
