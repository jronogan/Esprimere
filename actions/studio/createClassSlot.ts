"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ClassLevel, DayOfWeek } from "@/app/generated/prisma/client";

export async function createClassSlot({
  studioId,
  roomId,
  instructorId,
  title,
  genre,
  level,
  dayOfWeek,
  startTime,
  endTime,
  durationMins,
  maxPax,
  creditCost,
}: {
  studioId: string;
  roomId: string;
  instructorId: string;
  title: string;
  genre: string;
  level: ClassLevel;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  durationMins: number;
  maxPax: number;
  creditCost?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  const overlap = await prisma.classSlot.findFirst({
    where: {
      roomId,
      dayOfWeek,
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  if (overlap) throw new Error("Class slot overlaps with an existing slot.");

  return prisma.classSlot.create({
    data: {
      studioId,
      roomId,
      instructorId,
      title,
      genre,
      level,
      dayOfWeek,
      startTime,
      endTime,
      durationMins,
      maxPax,
      creditCost: creditCost ?? 1,
    },
  });
}
