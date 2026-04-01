"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BookingStatus } from "@/app/generated/prisma/client";

export async function bookClass({
  classSlotId,
  date,
  studioId,
  userPassId,
}: {
  classSlotId: string;
  date: Date;
  studioId: string;
  userPassId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  const userId = session.user.id;

  const classSlot = await prisma.classSlot.findUnique({
    where: { id: classSlotId, studioId },
  });

  if (!classSlot) throw new Error("Class not found.");

  const bookingCount = await prisma.classBooking.count({
    where: {
      classSlotId,
      date,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    },
  });

  if (bookingCount >= classSlot.maxPax) throw new Error("Class is full.");

  const duplicate = await prisma.classBooking.findUnique({
    where: { userId_classSlotId_date: { userId, classSlotId, date } },
  });

  if (duplicate) throw new Error("You have already booked this class.");

  const userPass = await prisma.userPass.findUnique({
    where: { id: userPassId },
    include: { passPackage: true },
  });

  if (!userPass) throw new Error("Pass not found.");
  if (userPass.userId !== userId) throw new Error("Not authorized.");
  if (userPass.expiresAt && userPass.expiresAt < new Date())
    throw new Error("Your pass has expired.");
  if (
    userPass.passPackage.type === "CREDITS" &&
    (userPass.creditsRemaining ?? 0) < classSlot.creditCost
  )
    throw new Error("Insufficient credits.");

  return prisma.$transaction(async (tx) => {
    if (userPass.passPackage.type === "CREDITS") {
      await tx.userPass.update({
        where: { id: userPassId },
        data: { creditsRemaining: { decrement: classSlot.creditCost } },
      });
    }

    return tx.classBooking.create({
      data: {
        userId,
        studioId,
        classSlotId,
        date,
        status: BookingStatus.CONFIRMED,
        userPassId,
      },
    });
  });
}
