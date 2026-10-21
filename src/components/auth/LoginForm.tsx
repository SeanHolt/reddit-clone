"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Safe Initialization: Read URL parameters immediately during render
  const initialRegistered = searchParams.get("registered") === "true";
  const initialError = searchParams.get("error") === "CredentialsSignin";

  // 2. Derive initial strings instantly without triggering post-mount effects
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ? "Invalid email or password combination." : null);
  const [success, setSuccess] = useState<string | null>(initialRegistered ? "Account created successfully! Please log in." : null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.refresh();
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected login error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Log In</h1>
        <p className="text-sm text-gray-500">Welcome back to the community feed.</p>
      </div>

      {success && <p className="p-3 text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium">{success}</p>}
      {error && <p className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">{error}</p>}

      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 text-white rounded-full py-2 text-sm font-semibold hover:bg-orange-500 transition disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Log In"}
        </button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-200 w-full" />
        <span className="absolute bg-white px-3 text-xs text-gray-400 font-medium">OR</span>
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        disabled={isLoading}
        type="button"
        className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 rounded-full py-2 text-sm font-medium transition text-gray-700 disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.39-.35-2.14s.13-1.48.35-2.14V6.96H2.18C1.43 8.46 1 10.18 1 12s.43 3.54 1.18 5.04l3.66-2.85z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.96l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="text-xs text-center text-gray-500">
        New to Reddit?{" "}
        <Link href="/signup" className="text-orange-600 hover:underline font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
