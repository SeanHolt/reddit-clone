import { auth } from "@/auth";
import { ClientRedirectGuard } from "./ClientRedirectGuard";
import { connection } from 'next/server'

export async function HomeContent() {
    await connection();
  const session = await auth();
  
  // Detect if the logged-in user needs to claim a handle
  const needsOnboarding = !!(session && !session.user.username);

  return (
    <div className="space-y-4">
      {/* 
        This client-side guard component checks the boolean flag safely.
        If true, it immediately routes the window without breaking the static compiler thread.
      */}
      <ClientRedirectGuard trigger={needsOnboarding} />

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Trending Feed</h1>
      <p className="text-gray-500">
        {session && session.user.username
          ? `Welcome back, u/${session.user.username}! You are securely logged in.` 
          : "Welcome! Log in using the navbar to start participating."
        }
      </p>
    </div>
  );
}
