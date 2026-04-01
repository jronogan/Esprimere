"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
  dateOfBirth,
  studioId,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  studioId: string;
}) {
  const existing = await prisma.user.findFirst({
    where: { email, studioId },
  });
  if (existing) {
    throw new Error("Email is already in use.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: Role.STUDENT,
      dateOfBirth,
      studioId,
    },
  });

  return user;
}
