import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    // 1. Authenticate user and ensure onboarding is complete
    if (!session || !session.user || !session.user.id || !session.user.username) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    // 2. Parse form body payload values
    const { displayName, bio, imageUrl } = await req.json();

    // 3. Optional payload sanity checks
    if (displayName && displayName.length > 30) {
      return NextResponse.json({ message: "Display name cannot exceed 30 characters." }, { status: 422 });
    }

    if (bio && bio.length > 300) {
      return NextResponse.json({ message: "Bio text description cannot exceed 300 characters." }, { status: 422 });
    }

    // 4. Update the matching user row dynamically inside SQLite
    await db.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName || null,
        bio: bio || null,
        image: imageUrl || null, // Updates both Auth fallback avatar reference fields
      },
    });

    return NextResponse.json({ message: "Profile updated successfully." }, { status: 200 });
  } catch (error: unknown) {
    console.error("PROFILE_PATCH_API_CRASH:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
