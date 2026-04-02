"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function updateProfile({
  firstName,
  lastName,
  email,
  dateOfBirth,
}: {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      email,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    },
  });
}
