import { Suspense } from "react";
import { HomeFeed } from "@/components/home/HomeFeed";
import { TrendingCommunitiesSidebar } from "@/components/home/TrendingCommunitiesSidebar"; // Import our trending component
import { CreateCommunitySidebarCard } from "@/components/home/CreateCommunitySidebarCard";
import { MarketplaceSidebarCard } from "@/components/home/MarketplaceSidebarCard";

interface PageProps {
    searchParams: Promise<{ feed?: string; sort?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
    return (
        <div className="py-6 max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Left Post Feed Pipeline Layout */}
            <div className="md:col-span-2">
                <Suspense fallback={<div className="h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse shadow-sm" />}>
                    <HomeFeed searchParamsPromise={searchParams} />
                </Suspense>
            </div>

            {/* Right Sidebar Columns Container Grid */}
            <div className="hidden md:block space-y-4">
                <Suspense fallback={<div className="h-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse shadow-sm" />}>
                    <CreateCommunitySidebarCard />
                </Suspense>
                <MarketplaceSidebarCard />
                <Suspense fallback={
                    <div className="h-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-pulse shadow-sm" />
                }>
                    <TrendingCommunitiesSidebar />
                </Suspense>
            </div>
        </div>
    );
}
