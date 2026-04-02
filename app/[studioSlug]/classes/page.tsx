import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { userInitials } from "@/lib/functions";
import { BookingStatus } from "@/app/generated/prisma/client";
import ClassesClient from "./ClassesClient";

const DOW_JS: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export default async function ClassesPage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${studioSlug}/login`);

  const [studio, user] = await Promise.all([
    prisma.studio.findUnique({ where: { slug: studioSlug } }),
    prisma.user.findUnique({ where: { id: session.user.id } }),
  ]);

  if (!studio || !user) notFound();

  // Next 3 days starting today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d;
  });

  const windowEnd = new Date(days[2]);
  windowEnd.setHours(23, 59, 59, 999);

  const [classSlots, bookingCounts, userPasses, passPackages, existingBookings] =
    await Promise.all([
      prisma.classSlot.findMany({
        where: { studioId: studio.id },
        include: { room: true, instructor: true },
      }),
      prisma.classBooking.groupBy({
        by: ["classSlotId", "date"],
        where: {
          studioId: studio.id,
          date: { gte: days[0], lte: windowEnd },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        },
        _count: { id: true },
      }),
      prisma.userPass.findMany({
        where: { userId: session.user.id, studioId: studio.id },
        include: { passPackage: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.passPackage.findMany({
        where: { studioId: studio.id, isActive: true },
        orderBy: { price: "asc" },
      }),
      prisma.classBooking.findMany({
        where: {
          userId: session.user.id,
          studioId: studio.id,
          date: { gte: days[0], lte: windowEnd },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        },
        select: { classSlotId: true, date: true },
      }),
    ]);

  // Build occurrence list for each of the 3 days
  const occurrences = [];
  for (const day of days) {
    const jsDay = day.getDay();
    const matching = classSlots.filter((s) => DOW_JS[s.dayOfWeek] === jsDay);
    for (const slot of matching) {
      const count =
        bookingCounts.find(
          (bc) =>
            bc.classSlotId === slot.id &&
            new Date(bc.date).toDateString() === day.toDateString()
        )?._count.id ?? 0;

      const alreadyBooked = existingBookings.some(
        (b) =>
          b.classSlotId === slot.id &&
          new Date(b.date).toDateString() === day.toDateString()
      );

      occurrences.push({
        slotId: slot.id,
        title: slot.title,
        genre: slot.genre,
        level: slot.level as string,
        dayOfWeek: slot.dayOfWeek as string,
        date: day.toISOString(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: { name: slot.room.name },
        instructor: slot.instructor ? { name: slot.instructor.name } : null,
        maxPax: slot.maxPax,
        creditCost: slot.creditCost,
        bookingCount: count,
        alreadyBooked,
      });
    }
  }

  occurrences.sort((a, b) => {
    const dateCompare =
      new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <ClassesClient
      studioId={studio.id}
      studioSlug={studioSlug}
      studioName={studio.name}
      userInitials={userInitials(user.firstName ?? "", user.lastName ?? "")}
      userEmail={user.email}
      occurrences={occurrences}
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
      passPackages={passPackages.map((p) => ({
        id: p.id,
        name: p.name,
        credits: p.credits,
        price: Number(p.price),
        expiryDays: p.expiryDays,
        type: p.type,
        isActive: p.isActive,
      }))}
    />
  );
}
