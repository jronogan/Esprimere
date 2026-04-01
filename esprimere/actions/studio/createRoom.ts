"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createRoom({
  studioId,
  name,
  areaSqm,
  maxPax,
  amenities,
  photos,
  isActive = true,
}: {
  studioId: string;
  name: string;
  areaSqm?: number;
  maxPax: number;
  amenities?: string[];
  photos?: string[];
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
  });

  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  return prisma.room.create({
    data: {
      studioId,
      name,
      areaSqm,
      maxPax,
      amenities: amenities ?? [],
      photos: photos ?? [],
      isActive,
    },
  });
}
