"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createPassPackage({
  studioId,
  name,
  type,
  credits,
  price,
  expiryDays,
  isActive = true,
}: {
  studioId: string;
  name: string;
  type: "CREDITS" | "UNLIMITED";
  credits?: number;
  price: number;
  expiryDays?: number;
  isActive?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  await prisma.passPackage.create({
    data: {
      studioId,
      name,
      type,
      credits: type === "CREDITS" ? credits : null,
      price,
      expiryDays: expiryDays ?? null,
      isActive,
    },
  });
}
