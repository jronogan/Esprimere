"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function replaceInstructor({
  studioId,
  classSlotId,
  date,
  replacementInstructorId,
}: {
  studioId: string;
  classSlotId: string;
  date: Date;
  replacementInstructorId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  // Verify the class slot belongs to this studio
  const classSlot = await prisma.classSlot.findUnique({
    where: { id: classSlotId },
  });

  if (!classSlot || classSlot.studioId !== studioId)
    throw new Error("Class slot not found.");

  // Verify the replacement instructor belongs to this studio
  const instructor = await prisma.instructor.findUnique({
    where: { id: replacementInstructorId },
  });

  if (!instructor || instructor.studioId !== studioId)
    throw new Error("Instructor not found.");

  // Set override instructor on all confirmed/pending bookings for that date
  return prisma.classBooking.updateMany({
    where: {
      classSlotId,
      date,
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    data: { overrideInstructorId: replacementInstructorId },
  });
}
