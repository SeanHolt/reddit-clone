import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();

    // 1. Authenticate user and ensure onboarding is fully complete
    if (!session?.user?.id || !session.user.username) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { subredditId } = await req.json();

    if (!subredditId) {
      return NextResponse.json({ message: "Subreddit ID is required." }, { status: 422 });
    }

    // 2. Query to verify if the subscription membership entry already exists
    const existingSubscription = await db.subscription.findUnique({
      where: {
        userId_subredditId: {
          userId: session.user.id,
          subredditId,
        },
      },
    });

    if (existingSubscription) {
      // 3. Action: Leave community by removing the subscription link record
      await db.subscription.delete({
        where: {
          userId_subredditId: {
            userId: session.user.id,
            subredditId,
          },
        },
      });

      return NextResponse.json({ message: "Successfully left community." }, { status: 200 });
    }

    // 4. Action: Join community by instantiating a new membership row record
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId,
      },
    });

    return NextResponse.json({ message: "Successfully joined community." }, { status: 201 });
  } catch (error: any) {
    console.error("MEMBERSHIP_TOGGLE_API_CRASH:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
