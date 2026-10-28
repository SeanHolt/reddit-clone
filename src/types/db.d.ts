import { Prisma } from "@prisma/client";

// Explicit compound database type declarations incorporating deep include properties
export type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; username: true; displayName: true; image: true; isShadowBanned: true } };
    subreddit: { include: { customEmojis: { select: { shortcode: true; base64Data: true } } } };
    votes: { select: { id: true; type: true; userId: true; postId: true } };
    media: { select: { id: true; url: true } };
    reports: { select: { id: true } };
    awards: { select: { id: true; awardType: true } };
    
    // FIXED: Enforce clear, strict type boundaries for nested poll structures [INDEX]
    pollOptions: {
      include: {
        votes: { select: { userId: true } }
      }
    };
    
    _count: { select: { comments: true; views: true } };
  };
}>;


export type CommentWithRelations = Prisma.CommentGetPayload<{
  include: {
    author: { select: { id: true; username: true; displayName: true } };
    votes: { select: { id: true; type: true; userId: true; commentId: true } };
  };
}>;
export type SubredditWithRelations = Prisma.SubredditGetPayload<{
  include: {
    customEmojis: { select: { shortcode: true; base64Data: true } };
    customTags: { select: { id: true; label: true; bgHex: true } };
    
    // FIXED: Explicitly register the live streams relation schema inside the global type matrix
    liveStreams: {
      where: { status: "STREAMING" };
      select: { id: true; title: true; viewerCount: true; streamerId: true };
    };
  };
}>;
export type SubredditWithRelations = Prisma.SubredditGetPayload<{
    include: {
        flairs: true;
        subscribers: true;
        megathreadLinks: true;
        posts: {
            include: { author: true; votes: true; media: true; _count: { select: { comments: true } } };
        };
    };
}>;