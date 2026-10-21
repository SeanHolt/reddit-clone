import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "./ProfileEditForm";
import { connection } from 'next/server'

export async function ProfileEditFormWrapper() {
    await connection();
  const session = await auth();

  // Enforce account protection safely inside the dynamic stream
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Fetch current user values from our local SQLite file
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, bio: true, image: true },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileEditForm user={user} />;
}
