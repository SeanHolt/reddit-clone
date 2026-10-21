import Link from "next/link";
import { Suspense } from "react";
import { NavbarProfile } from "./NavbarProfile";
import { NavbarSearch } from "./NavbarSearch";
import { NavbarRecentDropdown } from "./NavbarRecentDropdown";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 mr-2">
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            reddit<span className="text-orange-600">clone</span>
          </span>
        </Link>
        <NavbarRecentDropdown />
      </div>

      <NavbarSearch />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Suspense fallback={<div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />}>
          <NavbarProfile />
        </Suspense>
      </div>
    </nav>
  );
}
