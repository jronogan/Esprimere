import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { userInitials } from "@/lib/functions";
import { BookingStatus } from "@/app/generated/prisma/client";
import StudioRentalClient from "./StudioRentalClient";

export default async function StudioRentalPage({
  params,
}: {
  params: Promise<{ studioSlug: string }>;
}) {
  const { studioSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${studioSlug}/login`);

  const [studio, user] = await Promise.all([
    prisma.studio.findUnique({
      where: { slug: studioSlug },
      include: {
        rooms: {
          where: { isActive: true },
          include: { availability: true },
        },
      },
    }),
    prisma.user.findUnique({ where: { id: session.user.id } }),
  ]);

  if (!studio || !user) notFound();

  // Get all confirmed/pending studio bookings for the next 6 months
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setMonth(to.getMonth() + 6);

  const existingBookings = await prisma.studioBooking.findMany({
    where: {
      studioId: studio.id,
      date: { gte: from, lte: to },
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    },
    select: { roomId: true, date: true, startTime: true, endTime: true },
  });

  return (
    <StudioRentalClient
      studioId={studio.id}
      studioSlug={studioSlug}
      studioName={studio.name}
      userInitials={userInitials(user.firstName ?? "", user.lastName ?? "")}
      userEmail={user.email}
      rooms={studio.rooms.map((r) => ({
        id: r.id,
        name: r.name,
        areaSqm: r.areaSqm,
        maxPax: r.maxPax,
        amenities: r.amenities,
        photos: r.photos,
        availability: r.availability.map((a) => ({
          dayOfWeek: a.dayOfWeek as string,
          openTime: a.openTime,
          closeTime: a.closeTime,
          hourlyRate: Number(a.hourlyRate),
          bookingMode: a.bookingMode as string,
        })),
      }))}
      bookedDates={existingBookings.map((b) => ({
        roomId: b.roomId,
        date: b.date.toISOString(),
        startTime: b.startTime,
        endTime: b.endTime,
      }))}
    />
  );
}
