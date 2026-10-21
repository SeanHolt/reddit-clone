import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateCommunityForm } from "./CreateCommunityForm";
import { connection } from "next/server";

export async function CreateCommunityWrapper() {
    await connection();
  const session = await auth();

  // Enforce account protection at the streaming gateway
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Enforce username handle completion onboarding check
  if (!session.user.username) {
    redirect("/settings/username");
  }

  return <CreateCommunityForm />;
}
