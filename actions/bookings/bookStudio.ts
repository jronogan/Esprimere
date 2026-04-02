"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { BookingStatus } from "@/app/generated/prisma/client";

export async function bookStudio({
  studioId,
  roomId,
  date,
  startTime,
  endTime,
  totalAmount,
}: {
  studioId: string;
  roomId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  const userId = session.user.id;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error("Room not found.");

  const overlap = await prisma.studioBooking.findFirst({
    where: {
      roomId,
      date,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
    },
  });

  if (overlap) throw new Error("Room is already booked for this time slot.");

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "sgd",
          unit_amount: Math.round(totalAmount * 100),
          product_data: { name: `Studio Booking - ${date.toDateString()}` },
        },
      },
    ],
    metadata: { userId, studioId, roomId, startTime, endTime, date: date.toISOString() },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings`,
  });

  return prisma.studioBooking.create({
    data: {
      userId,
      studioId,
      roomId,
      date,
      startTime,
      endTime,
      totalAmount,
      status: BookingStatus.PENDING,
      stripeSessionId: stripeSession.id,
    },
  });
}
