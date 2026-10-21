import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ClaimUsernameForm } from "@/components/profile/ClaimUsernameForm";

export const instant = false;

export default async function ClaimUsernameOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // If the active session user has already claimed a true custom handle, redirect them away
  if (session.user.username && !session.user.username.startsWith("user_")) {
    redirect("/");
  }

  return (
    <div className="py-16 max-w-xl mx-auto space-y-4 animate-fadeIn">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">Onboarding Checkpoint</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Migrate your temporary profile matrix to lock in your custom handle space.</p>
      </div>
      <ClaimUsernameForm />
    </div>
  );
}