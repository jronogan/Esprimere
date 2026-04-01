"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function updateStudio({
  studioId,
  data,
}: {
  studioId: string;
  data: {
    name?: string;
    slug?: string;
    description?: string;
    brandColor?: string;
    logoUrl?: string;
    isLive?: boolean;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
  });

  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  // If slug is changing, check it's not already taken
  if (data.slug && data.slug !== studio.slug) {
    const slugTaken = await prisma.studio.findUnique({
      where: { slug: data.slug },
    });
    if (slugTaken) throw new Error("That studio URL is already taken.");
  }

  return prisma.studio.update({
    where: { id: studioId },
    data,
  });
}
