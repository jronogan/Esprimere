"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";

export async function registerStudio({
  firstName,
  lastName,
  email,
  password,
  studioName,
  slug,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studioName: string;
  slug: string;
}) {
  const existing = await prisma.user.findFirst({
    where: { email, studioId: null },
  });
  if (existing) {
    throw new Error("Email is already in use.");
  }

  const existingSlug = await prisma.studio.findUnique({
    where: { slug },
  });
  if (existingSlug) {
    throw new Error("Slug is already in use.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  //   do not create separately to ensure that you do not create one field without the other
  const { studioOwner, studio } = await prisma.$transaction(async (tx) => {
    const studioOwner = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Role.STUDIO_OWNER,
      },
    });

    const studio = await tx.studio.create({
      data: {
        ownerId: studioOwner.id,
        name: studioName,
        slug,
      },
    });

    return { studioOwner, studio };
  });

  return { studioOwner, studio };
}
