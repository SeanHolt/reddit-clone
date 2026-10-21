import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 convention requires the function name to match the file
export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const session = await auth();
  const isLoggedIn = !!session;

  const isOnOnboardingPage = nextUrl.pathname === "/settings/username";

  // Prevent users who ALREADY have a username from lingering on onboarding page
  if (isOnOnboardingPage && isLoggedIn && session?.user?.username) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

// Statically analyzed matchers
export const config = {
  matcher: ["/settings/username"],
};
