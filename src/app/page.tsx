import { Suspense } from "react";
import { HomeFeed } from "@/components/home/HomeFeed";

interface HomePageProps {
  searchParams: Promise<{ feed?: string }>;
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <div className="py-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Home Feed</h1>
        <p className="text-sm text-gray-500 mt-1">Your aggregated stream of communities and trending topics.</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-white border border-gray-200 rounded-xl" />
            <div className="bg-white p-5 border border-gray-200 rounded-xl h-32" />
            <div className="bg-white p-5 border border-gray-200 rounded-xl h-32" />
          </div>
        }
      >
        {/* Pass down the search params promise to let it stream independently */}
        <HomeFeed searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
