"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ClassLevel, DayOfWeek } from "@/app/generated/prisma/client";

export async function updateClassSlot({
  classSlotId,
  studioId,
  data,
}: {
  classSlotId: string;
  studioId: string;
  data: {
    roomId?: string;
    instructorId?: string;
    title?: string;
    genre?: string;
    level?: ClassLevel;
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
    durationMins?: number;
    maxPax?: number;
    creditCost?: number;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  const classSlot = await prisma.classSlot.findUnique({
    where: { id: classSlotId },
  });

  if (!classSlot || classSlot.studioId !== studioId)
    throw new Error("Class slot not found.");

  // If time or day is changing, check for overlaps
  const roomId = data.roomId ?? classSlot.roomId;
  const dayOfWeek = data.dayOfWeek ?? classSlot.dayOfWeek;
  const startTime = data.startTime ?? classSlot.startTime;
  const endTime = data.endTime ?? classSlot.endTime;

  if (data.startTime || data.endTime || data.dayOfWeek || data.roomId) {
    const overlap = await prisma.classSlot.findFirst({
      where: {
        id: { not: classSlotId },
        roomId,
        dayOfWeek,
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
    });

    if (overlap) throw new Error("Updated time overlaps with an existing slot.");
  }

  return prisma.classSlot.update({
    where: { id: classSlotId },
    data,
  });
}
