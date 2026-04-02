"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function updatePassPackage({
  packageId,
  studioId,
  data,
}: {
  packageId: string;
  studioId: string;
  data: {
    name?: string;
    type?: "CREDITS" | "UNLIMITED";
    credits?: number | null;
    price?: number;
    expiryDays?: number | null;
    isActive?: boolean;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "STUDIO_OWNER") throw new Error("Not authorized.");

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio || studio.ownerId !== session.user.id) throw new Error("Not authorized.");

  const pkg = await prisma.passPackage.findUnique({ where: { id: packageId } });
  if (!pkg || pkg.studioId !== studioId) throw new Error("Package not found.");

  await prisma.passPackage.update({
    where: { id: packageId },
    data,
  });
}
