import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SubredditMegathreadHub } from "./SubredditMegathreadHub";
import { AudioStageConsole } from "../streaming/AudioStageConsole";
import { FederationTimelineTabs } from "./FederationTimelineTabs";
import { InfiniteScrollStream } from "../ui/InfiniteScrollStream";
import { PostWithRelations } from "@/types/db";
import { connection } from "next/server";

interface SubredditViewProps {
  slug: string;
  // FIXED: Explicitly accept the asynchronous searchParams promise forwarded from the parent page route
  searchParamsPromise: Promise<{ feedMode?: string; sort?: string }>;
}

export async function SubredditView({ slug, searchParamsPromise }: SubredditViewProps) {
  await connection();
  const session = await auth();
  const searchParams = await searchParamsPromise;
  
  const currentFeedMode = searchParams.feedMode === "FEDERATION" ? "FEDERATION" : "LOCAL";
  const activeSort = searchParams.sort || "new";

  // 1. Fetch targeted community metadata, sticky links, and active WebRTC streaming arrays
  const subreddit = await db.subreddit.findUnique({
    where: { name: slug.toLowerCase() },
    include: {
      megathreadLinks: true,
      liveStreams: {
        where: { status: "STREAMING" },
        select: { id: true, title: true, viewerCount: true },
        take: 1
      }
    }
  });

  if (!subreddit) notFound();

  // 2. Query database records to verify if this community has any established federation links
  const fedCount = await db.subredditFederation.count({
    where: { subredditId: subreddit.id, status: "ACTIVE" }
  });

  // 3. Query initial posts matching our current filter selection scope
  const matchFilters: Record<string, unknown> = {};
  if (currentFeedMode === "FEDERATION") {
    const alliances = await db.subredditFederation.findMany({
      where: { subredditId: subreddit.id, status: "ACTIVE" },
      select: { federation: { select: { alliances: { select: { subredditId: true } } } } }
    });
    const alliedIds = alliances.flatMap((a) => a.federation.alliances.map((sub) => sub.subredditId));
    matchFilters.subredditId = { in: Array.from(new Set([subreddit.id, ...alliedIds])) };
  } else {
    matchFilters.subredditId = subreddit.id;
  }

  const initialPosts = await db.post.findMany({
    where: matchFilters,
    take: 10,
    orderBy: { createdAt: activeSort === "new" ? "desc" : "asc" },
    include: {
      author: { select: { id: true, username: true, displayName: true, image: true, subredditProgress: true } },
      subreddit: { include: { customEmojis: true } },
      votes: true,
      media: true,
      pollOptions: { include: { votes: true } },
      _count: { select: { comments: true } }
    }
  }) as unknown as PostWithRelations[];

  const nextCursor = initialPosts.length === 10 ? initialPosts[initialPosts.length - 1].id : null;
  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6 px-4 animate-fadeIn">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tight">r/{subreddit.name}</h1>
        <p className="text-xs font-semibold text-gray-400">{subreddit.description}</p>
      </div>

      <SubredditMegathreadHub links={subreddit.megathreadLinks || []} />

      {/* Mount the interactive multi-feed tab toggles cleanly */}
      <FederationTimelineTabs 
        currentFeed={currentFeedMode} 
        hasFederation={fedCount > 0} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Feed Pipeline Stream Container */}
          <InfiniteScrollStream 
            initialPosts={initialPosts} 
            initialNextCursor={nextCursor} 
            currentUserId={session?.user?.id} 
            feedType={currentFeedMode === "FEDERATION" ? "FEDERATION" : activeSort} 
            subredditId={subreddit.id}
          />
        </div>
        
        <div className="space-y-4">
          <AudioStageConsole subredditId={subreddit.id} />
        </div>
      </div>
    </div>
  );
}
