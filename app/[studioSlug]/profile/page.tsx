import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UserProfileClient from "./UserProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;
  const session = await auth();

  if (!session?.user) redirect(`/${studioSlug}/login`);

  const [studio, user, userPasses, classBookings, studioBookings, passPackages] =
    await Promise.all([
      prisma.studio.findUnique({ where: { slug: studioSlug } }),
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.userPass.findMany({
        where: { userId: session.user.id, studioId: { not: undefined } },
        include: { passPackage: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.classBooking.findMany({
        where: { userId: session.user.id },
        include: {
          classSlot: { include: { room: true, instructor: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.studioBooking.findMany({
        where: { userId: session.user.id },
        include: { room: true },
        orderBy: { date: "desc" },
      }),
      prisma.passPackage.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      }),
    ]);

  if (!studio || !user) notFound();

  // Serialize Decimal / Date types before passing to client
  return (
    <UserProfileClient
      studioSlug={studioSlug}
      studioName={studio.name}
      user={{
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email,
        dateOfBirth: user.dateOfBirth?.toISOString().split("T")[0] ?? "",
      }}
      userPasses={userPasses.map((p) => ({
        id: p.id,
        creditsRemaining: p.creditsRemaining,
        expiresAt: p.expiresAt?.toISOString() ?? null,
        passPackage: {
          name: p.passPackage.name,
          credits: p.passPackage.credits,
          price: Number(p.passPackage.price),
          expiryDays: p.passPackage.expiryDays,
          type: p.passPackage.type,
        },
      }))}
      classBookings={classBookings.map((b) => ({
        id: b.id,
        date: b.date.toISOString(),
        status: b.status,
        classSlot: {
          title: b.classSlot.title,
          genre: b.classSlot.genre,
          startTime: b.classSlot.startTime,
          room: { name: b.classSlot.room.name },
          instructor: { name: b.classSlot.instructor.name },
        },
      }))}
      studioBookings={studioBookings.map((b) => ({
        id: b.id,
        date: b.date.toISOString(),
        startTime: b.startTime,
        endTime: b.endTime,
        totalAmount: Number(b.totalAmount),
        status: b.status,
        room: { name: b.room.name },
      }))}
      passPackages={passPackages.map((p) => ({
        id: p.id,
        name: p.name,
        credits: p.credits,
        price: Number(p.price),
        expiryDays: p.expiryDays,
        type: p.type,
      }))}
    />
  );
}
