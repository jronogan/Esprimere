"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BookingMode, DayOfWeek } from "@/app/generated/prisma/client";

export async function updateClassAvailability({
  studioId,
  roomId,
  dayOfWeek,
  openTime,
  closeTime,
  hourlyRate,
  bookingMode,
}: {
  studioId: string;
  roomId: string;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  hourlyRate: number;
  bookingMode: BookingMode;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id)
    throw new Error("Not authorized.");

  // Verify the room belongs to this studio
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room || room.studioId !== studioId) throw new Error("Room not found.");

  await prisma.studioAvailability.upsert({
    where: { roomId_dayOfWeek: { roomId, dayOfWeek } },
    update: { openTime, closeTime, hourlyRate, bookingMode },
    create: { roomId, dayOfWeek, openTime, closeTime, hourlyRate, bookingMode },
  });
}
