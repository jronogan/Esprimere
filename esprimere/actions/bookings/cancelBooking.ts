"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BookingStatus } from "@/app/generated/prisma/client";

export async function cancelBooking({ bookingId }: { bookingId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  const userId = session.user.id;

  const booking = await prisma.classBooking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found.");
  if (booking.userId !== userId) throw new Error("Not authorized.");
  if (booking.status === BookingStatus.CANCELLED)
    throw new Error("Booking is already cancelled.");

  return prisma.$transaction(async (tx) => {
    if (booking.userPassId) {
      const userPass = await tx.userPass.findUnique({
        where: { id: booking.userPassId },
        include: { passPackage: true },
      });

      if (userPass?.passPackage.type === "CREDITS") {
        const classSlot = await tx.classSlot.findUnique({
          where: { id: booking.classSlotId },
        });

        await tx.userPass.update({
          where: { id: booking.userPassId },
          data: { creditsRemaining: { increment: classSlot?.creditCost ?? 1 } },
        });
      }
    }

    return tx.classBooking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });
  });
}
