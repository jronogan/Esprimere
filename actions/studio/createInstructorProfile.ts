"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createInstructorProfile({
  studioId,
  name,
  bio,
  styles,
  photoUrl,
  isActive = true,
}: {
  studioId: string;
  name: string;
  bio?: string;
  styles: string[];
  photoUrl?: string;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
  });

  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  return prisma.instructor.create({
    data: {
      studioId,
      name,
      bio,
      styles,
      photoUrl,
      isActive,
    },
  });
}
