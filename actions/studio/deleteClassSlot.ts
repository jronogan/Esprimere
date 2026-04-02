"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BookingStatus } from "@/app/generated/prisma/client";

export async function deleteClassSlot({
  classSlotId,
  studioId,
}: {
  classSlotId: string;
  studioId: string;
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

  return prisma.$transaction(async (tx) => {
    // Fetch all future active bookings for this slot
    const futureBookings = await tx.classBooking.findMany({
      where: {
        classSlotId,
        date: { gte: new Date() },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      },
      include: { userPass: { include: { passPackage: true } } },
    });

    // Cancel each booking and refund credits if paid with a pass
    for (const booking of futureBookings) {
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

    return tx.classSlot.delete({
      where: { id: classSlotId },
    });
  });
}
