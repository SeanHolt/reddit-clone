import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logServerError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // 1. Enforce strict session authentication checks
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { name, description, bannerUrl, accentColor } = await req.json();

    // 2. Clear parameter syntax validation rules
    if (!name || name.trim().length < 3 || name.length > 21 || !/^[a-zA-Z0-9_]+$/.test(name)) {
      return NextResponse.json({ message: "Community name must be 3-21 alphanumeric characters." }, { status: 422 });
    }

    // Validate hex code structure color if provided by client input layers
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const validAccentColor = accentColor && hexRegex.test(accentColor) ? accentColor : "#ea580c";

    const communityExists = await db.subreddit.findUnique({
      where: { name: name.trim().toLowerCase() },
    });

    if (communityExists) {
      return NextResponse.json({ message: "A community with this name already exists." }, { status: 409 });
    }

    // 3. Create community row record atomically inside SQLite
    const subreddit = await db.subreddit.create({
      data: {
        name: name.trim().toLowerCase(),
        description: description?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        accentColor: validAccentColor,
        creatorId: session.user.id,
      },
    });

    // 4. Automatically auto-subscribe the creator to their own new community row
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id,
      },
    });

    return NextResponse.json({ subredditName: subreddit.name }, { status: 201 });
  } catch (error: unknown) {
    logServerError(error, "SUBREDDIT_CREATION_API_CRASH");
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}