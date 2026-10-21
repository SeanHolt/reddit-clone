import Link from "next/link";

export function SignInButton() {
  return (
    <Link 
      href="/login" 
      className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-full hover:bg-orange-500 transition-colors"
    >
      Log In
    </Link>
  );
}
