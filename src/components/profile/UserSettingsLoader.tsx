import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UserSettingsForm } from "./UserSettingsForm";
import { KarmaLedgerStream } from "./KarmaLedgerStream";
import { ProfileFlairManager } from "./ProfileFlairManager";

export async function UserSettingsLoader() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, bio: true, image: true }, // Added explicit image selection
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <UserSettingsForm
        initialDisplayName={user.displayName || ""}
        initialBio={user.bio || ""}
        initialImage={user.image || ""}
      />
      <ProfileFlairManager />
      <KarmaLedgerStream />
    </div>
  );
}
