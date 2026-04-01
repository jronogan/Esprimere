"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { BookingStatus } from "@/app/generated/prisma/client";

export async function cancelStudioBooking({ bookingId }: { bookingId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  const userId = session.user.id;

  const booking = await prisma.studioBooking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) throw new Error("Booking not found.");
  if (booking.userId !== userId) throw new Error("Not authorized.");
  if (booking.status === BookingStatus.CANCELLED)
    throw new Error("Booking is already cancelled.");

  if (booking.payment?.stripePaymentId) {
    await stripe.refunds.create({
      payment_intent: booking.payment.stripePaymentId,
    });
  }

  return prisma.studioBooking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });
}
