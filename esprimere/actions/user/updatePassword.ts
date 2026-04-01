"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updatePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) throw new Error("No password set on this account.");

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) throw new Error("Current password is incorrect.");

  const samePassword = await bcrypt.compare(newPassword, user.password);
  if (samePassword)
    throw new Error("New password must be different from current password.");

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });
}
