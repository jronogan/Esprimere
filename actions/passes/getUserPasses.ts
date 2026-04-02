"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getUserPasses(studioId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");

  return prisma.userPass.findMany({
    where: {
      userId: session.user.id,
      studioId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: { passPackage: true },
  });
}
