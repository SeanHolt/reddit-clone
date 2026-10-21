"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function FeedSortBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Default to "NEW" if no sorting query parameter is provided in the URL
    const currentSort = searchParams.get("sort") === "top" ? "TOP" : "NEW";

    const handleSortChange = (sortType: "new" | "top") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sortType);

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm mb-4 text-xs font-bold text-gray-500 transition-colors duration-200">
            <button
                type="button"
                onClick={() => handleSortChange("new")}
                className={`px-4 py-1.5 rounded-full transition-all ${currentSort === "NEW"
                        ? "bg-gray-100 dark:bg-gray-800 text-orange-600 dark:text-orange-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:text-gray-400"
                    }`}
            >
                ✨ New
            </button>
            <button
                type="button"
                onClick={() => handleSortChange("top")}
                className={`px-4 py-1.5 rounded-full transition-all ${currentSort === "TOP"
                        ? "bg-gray-100 dark:bg-gray-800 text-orange-600 dark:text-orange-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:text-gray-400"
                    }`}
            >
                🔥 Top
            </button>
        </div>
    );
}
