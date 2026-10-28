import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      postKarma: number | null;
      commentKarma: number | null;
    } & DefaultSession["user"];
  }
}
