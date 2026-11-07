import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { connection } from "next/server";

export async function GET() {
  try {
    await connection();
    
    // FIXED: Protect the route using a custom testing mode flag to bypass hardcoded framework NODE_ENV constraints
    if (process.env.APP_TESTING_MODE !== "true") {
      return NextResponse.json({ error: "Unauthorized environment context." }, { status: 403 });
    }

    await signIn("credentials", {
      email: "test@example.com",
      password: "test-password-placeholder-not-used-by-mock",
      redirect: false,
    });

    return NextResponse.json({ authenticated: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Failed to establish mock session context." }, { status: 500 });
  }
}
