"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createReview({
  studioId,
  rating,
  comment,
}: {
  studioId: string;
  rating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  const userId = session.user.id;

  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");

  const hasBooking = await prisma.classBooking.findFirst({
    where: { userId, studioId, status: "CONFIRMED" },
  });

  const hasStudioBooking = await prisma.studioBooking.findFirst({
    where: { userId, studioId, status: "CONFIRMED" },
  });

  if (!hasBooking && !hasStudioBooking)
    throw new Error("You must have attended a class or booked the studio to leave a review.");

  const existing = await prisma.review.findUnique({
    where: { userId_studioId: { userId, studioId } },
  });

  if (existing) throw new Error("You have already reviewed this studio.");

  return prisma.review.create({
    data: { userId, studioId, rating, comment },
  });
}
