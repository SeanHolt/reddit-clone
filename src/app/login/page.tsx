import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[75vh]">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-3 pt-4">
            <div className="h-10 bg-gray-200 rounded-lg" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
