"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BookingStatus } from "@/app/generated/prisma/client";

export async function cancelClassDate({
  studioId,
  classSlotId,
  date,
}: {
  studioId: string;
  classSlotId: string;
  date: Date;
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

  // Fetch all active bookings for this date
  const bookings = await prisma.classBooking.findMany({
    where: {
      classSlotId,
      date,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    },
    include: {
      userPass: { include: { passPackage: true } },
    },
  });

  return prisma.$transaction(async (tx) => {
    for (const booking of bookings) {
      // Refund credit if booking was paid with a pass
      if (booking.userPassId && booking.userPass?.passPackage.type === "CREDITS") {
        await tx.userPass.update({
          where: { id: booking.userPassId },
          data: { creditsRemaining: { increment: classSlot.creditCost } },
        });
      }

      await tx.classBooking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
      });
    }
  });
}
