"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function deleteReview({ studioId }: { studioId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  const userId = session.user.id;

  const existing = await prisma.review.findUnique({
    where: { userId_studioId: { userId, studioId } },
  });

  if (!existing) throw new Error("Review not found.");

  return prisma.review.delete({ where: { id: existing.id } });
}
