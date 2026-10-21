import { Suspense } from "react";
import { ProfileView } from "@/components/profile/ProfileView";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  return (
    <Suspense
      fallback={
        <div className="py-6 max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-32 w-full rounded-xl bg-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            <div className="md:col-span-2 h-48 bg-white border border-gray-200 rounded-xl" />
            <div className="h-48 bg-white border border-gray-200 rounded-xl" />
          </div>
        </div>
      }
    >
      {/* Pass down the unresolved params promise directly to the leaf component */}
      <ProfileView paramsPromise={params} />
    </Suspense>
  );
}
