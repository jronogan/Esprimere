"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function updateRoom({
  roomId,
  studioId,
  data,
}: {
  roomId: string;
  studioId: string;
  data: {
    name?: string;
    areaSqm?: number;
    maxPax?: number;
    amenities?: string[];
    photos?: string[];
    isActive?: boolean;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room || room.studioId !== studioId) throw new Error("Room not found.");

  return prisma.room.update({
    where: { id: roomId },
    data,
  });
}
