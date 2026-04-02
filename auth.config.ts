import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/app/generated/prisma/client";

// Edge-safe config — no bcrypt, no prisma imports.
// Used by middleware. Full auth (with credentials + adapter) is in lib/auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/studio/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.studioId = user.studioId;
        token.slug = user.slug;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.studioId = token.studioId as string | null;
      session.user.slug = token.slug as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
