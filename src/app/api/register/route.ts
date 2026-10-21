import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcrypt-ts";
import { logServerError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 422 });
    }

    const userExists = await db.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        displayName: null,
        image: null,
        username: null,
      },
    });

    return NextResponse.json({ message: "User successfully registered!" }, { status: 201 });
  } catch (error: unknown) { // Safe unknown type enforcement
    logServerError(error, "REGISTRATION_API");
    return NextResponse.json({ message: "An error occurred while creating your account." }, { status: 500 });
  }
}
