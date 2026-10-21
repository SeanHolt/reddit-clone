import { Prisma } from "@prisma/client";

// Explicit compound database type declarations incorporating deep include properties
export type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; username: true; displayName: true; image: true } };
    subreddit: { select: { id: true; name: true; accentColor: true; autoModKeywords: true } };
    votes: { select: { id: true; type: true; userId: true; postId: true } };
    media: { select: { id: true; url: true } };
    _count: { select: { comments: true; views: true } };
  };
}>;

export type CommentWithRelations = Prisma.CommentGetPayload<{
  include: {
    author: { select: { id: true; username: true; displayName: true } };
    votes: { select: { id: true; type: true; userId: true; commentId: true } };
  };
}>;