"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DayOfWeek } from "@/app/generated/prisma/client";

export async function deleteClassAvailability({
  studioId,
  roomId,
  dayOfWeek,
}: {
  studioId: string;
  roomId: string;
  dayOfWeek: DayOfWeek;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  await prisma.studioAvailability.deleteMany({
    where: { roomId, dayOfWeek },
  });
}
