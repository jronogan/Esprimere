"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function updateInstructorProfile({
  instructorId,
  studioId,
  data,
}: {
  instructorId: string;
  studioId: string;
  data: {
    name?: string;
    bio?: string;
    styles?: string[];
    photoUrl?: string;
    isActive?: boolean;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id)
    throw new Error("Not authorized.");

  const instructor = await prisma.instructor.findUnique({
    where: { id: instructorId },
  });

  if (!instructor) throw new Error("Instructor not found.");

  if (instructor.studioId !== studioId)
    throw new Error("Instructor does not belong to this studio.");

  return prisma.instructor.update({
    where: { id: instructorId },
    data,
  });
}
