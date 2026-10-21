import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { DirectMessagePane, MessageItem } from "./DirectMessagePane";
import { connection } from "next/server";

interface DirectMessageWrapperProps {
  userIdPromise: Promise<{ userId: string }>;
}

export async function DirectMessageWrapper({ userIdPromise }: DirectMessageWrapperProps) {
    await connection();
  const { userId } = await userIdPromise;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Prevent users from starting chat panels with themselves
  if (session.user.id === userId) {
    redirect("/");
  }

  // Fetch target recipient details
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!targetUser) {
    notFound();
  }

  // Pull historical messages between active user and target recipient
  const rawDMs = await db.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: userId },
        { senderId: userId, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Map database dates safely to static primitive strings for Next.js 16 prefetching checks
  const initialMessages: MessageItem[] = rawDMs.map((dm) => ({
    id: dm.id,
    text: dm.text,
    senderId: dm.senderId,
    receiverId: dm.receiverId,
    createdAt: dm.createdAt.toISOString(),
  }));

  return (
    <DirectMessagePane
      initialMessages={initialMessages}
      currentUserId={session.user.id}
      receiverId={targetUser.id}
      receiverUsername={targetUser.username || "anonymous"}
    />
  );
}