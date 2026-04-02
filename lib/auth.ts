import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // @ts-expect-error next-auth v5 beta type conflict: adapter + jwt strategy + credentials
  adapter: PrismaAdapter(prisma as any),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        studioSlug: { label: "Studio Slug", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        let studioId: string | null = null;
        let studio = null;

        if (credentials.studioSlug) {
          studio = await prisma.studio.findUnique({
            where: { slug: credentials.studioSlug as string },
          });
          if (!studio) return null;
          studioId = studio.id;
        }

        const user = studioId
          ? await prisma.user.findUnique({
              where: {
                email_studioId: {
                  email: credentials.email as string,
                  studioId,
                },
              },
            })
          : await prisma.user.findFirst({
              where: { email: credentials.email as string, studioId: null },
            });

        // !user.password accounts for OAuth sign-ins
        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordMatch) return null;

        // For studio owners, studioId on the user row is null (it's a student field).
        // Look up their owned studio to get the correct studioId for the JWT.
        if (user.role === "STUDIO_OWNER") {
          const ownedStudio = await prisma.studio.findUnique({
            where: { ownerId: user.id },
          });
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            role: user.role,
            studioId: ownedStudio?.id ?? null,
            slug: ownedStudio?.slug ?? null,
          };
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          role: user.role,
          studioId: user.studioId,
          slug: studio?.slug ?? null,
        };
      },
    }),
  ],
});
