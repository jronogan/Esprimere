import type { Role } from "../app/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    studioId: string | null;
    slug: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      studioId: string | null;
      slug: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    studioId: string | null;
    slug: string | null;
  }
}
