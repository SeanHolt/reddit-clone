import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { compare } from "bcrypt-ts";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, // Credentials require JWT session strategies
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Find the local user
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Block if user doesn't exist or signed up via Google instead of credentials
        if (!user || !user.password) return null;

        // Verify the hashed password match
        const isPasswordValid = await compare(credentials.password as string, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          displayName: user.displayName || null,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    // When using JWT strategy, we map the DB data into the token first
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;

        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { username: true },
        });

        session.user.username = dbUser?.username || null;
      }
      return session;
    },
  },
});
