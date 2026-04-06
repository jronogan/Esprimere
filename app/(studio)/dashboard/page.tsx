import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DayOfWeek } from "@/app/generated/prisma/client";
import { userInitials } from "@/lib/functions";
import DashboardClient from "./DashboardClient";
import type {
  DashboardStatsDTO,
  RoomDTO,
  InstructorDTO,
  ClassSlotDTO,
  PassPackageDTO,
  StudioAvailabilityDTO,
  TodayClassDTO,
  UpcomingRentalDTO,
  AllBookingDTO,
} from "@/lib/types";

const DOW_ORDER: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export default async function DashboardPage() {
  const session = await auth();
  const studioId = session!.user.studioId!;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const todayDow = DOW_ORDER[now.getDay()];

  const [
    studio,
    rooms,
    instructors,
    classSlots,
    passPackages,
    availabilities,
    classesThisWeek,
    bookingsToday,
    rentalsThisMonth,
    revenueAgg,
    todayClassSlots,
    upcomingRentals,
    allClassBookings,
    allStudioBookings,
  ] = await Promise.all([
    prisma.studio.findUnique({
      where: { id: studioId },
      include: { owner: { select: { firstName: true, lastName: true } } },
    }),
    prisma.room.findMany({ where: { studioId }, orderBy: { name: "asc" } }),
    prisma.instructor.findMany({
      where: { studioId },
      include: { _count: { select: { classSlots: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.classSlot.findMany({
      where: { studioId },
      include: { room: true, instructor: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.passPackage.findMany({ where: { studioId }, orderBy: { price: "asc" } }),
    prisma.studioAvailability.findMany({
      where: { room: { studioId } },
      include: { room: { select: { name: true } } },
    }),
    prisma.classBooking.count({
      where: { classSlot: { studioId }, date: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.classBooking.count({
      where: {
        classSlot: { studioId },
        date: { gte: today, lt: tomorrow },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
    prisma.studioBooking.count({
      where: { studioId, date: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.payment.aggregate({
      where: { studioId, createdAt: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.classSlot.findMany({
      where: { studioId, dayOfWeek: todayDow },
      include: {
        room: { select: { name: true } },
        instructor: { select: { name: true } },
        bookings: {
          where: {
            date: { gte: today, lt: tomorrow },
            status: { in: ["CONFIRMED", "PENDING"] },
          },
          include: { overrideInstructor: { select: { name: true } } },
          take: 1,
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.studioBooking.findMany({
      where: { studioId, date: { gte: today }, status: { in: ["CONFIRMED", "PENDING"] } },
      include: { room: { select: { name: true } }, user: { select: { firstName: true, lastName: true } } },
      orderBy: { date: "asc" },
      take: 10,
    }),
    prisma.classBooking.findMany({
      where: { classSlot: { studioId } },
      include: {
        classSlot: { include: { room: { select: { name: true } } } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: "desc" },
      take: 100,
    }),
    prisma.studioBooking.findMany({
      where: { studioId },
      include: {
        room: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { date: "desc" },
      take: 100,
    }),
  ]);

  if (!studio || studio.ownerId !== session!.user.id) redirect("/studio/login");

  // ── Serialize DTOs ──────────────────────────────────────────────────────────

  const stats: DashboardStatsDTO = {
    classesThisWeek,
    bookingsToday,
    rentalsThisMonth,
    revenueThisMonth: Number(revenueAgg._sum.amount ?? 0),
  };

  const roomDTOs: RoomDTO[] = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    areaSqm: r.areaSqm ? Number(r.areaSqm) : null,
    maxPax: r.maxPax,
    amenities: r.amenities,
    photos: r.photos,
    isActive: (r as any).isActive ?? true,
  }));

  const instructorDTOs: InstructorDTO[] = instructors.map((i) => ({
    id: i.id,
    name: i.name,
    bio: i.bio,
    styles: i.styles,
    photoUrl: i.photoUrl,
    isActive: (i as any).isActive ?? true,
    classCount: i._count.classSlots,
  }));

  const classSlotDTOs: ClassSlotDTO[] = classSlots.map((s) => ({
    id: s.id,
    title: s.title,
    genre: s.genre,
    level: s.level,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    maxPax: s.maxPax,
    creditCost: s.creditCost,
    room: { id: s.room.id, name: s.room.name },
    instructor: s.instructor ? { id: s.instructor.id, name: s.instructor.name } : null,
  }));

  const passPackageDTOs: PassPackageDTO[] = passPackages.map((p) => ({
    id: p.id,
    name: p.name,
    credits: p.credits,
    price: Number(p.price),
    expiryDays: p.expiryDays,
    type: p.type,
    isActive: p.isActive,
  }));

  const availabilityDTOs: StudioAvailabilityDTO[] = availabilities.map((a) => ({
    id: a.id,
    roomId: a.roomId,
    roomName: a.room.name,
    dayOfWeek: a.dayOfWeek,
    openTime: a.openTime,
    closeTime: a.closeTime,
    hourlyRate: Number(a.hourlyRate),
    bookingMode: a.bookingMode,
  }));

  const todayClassDTOs: TodayClassDTO[] = todayClassSlots.map((s) => ({
    id: s.id,
    title: s.title,
    startTime: s.startTime,
    room: { name: s.room.name },
    instructor: s.instructor ? { name: s.instructor.name } : null,
    overrideInstructor: s.bookings[0]?.overrideInstructor ?? null,
    maxPax: s.maxPax,
    bookingCount: s.bookings.length,
  }));

  const upcomingRentalDTOs: UpcomingRentalDTO[] = upcomingRentals.map((b) => ({
    id: b.id,
    renterName: `${b.user.firstName} ${b.user.lastName}`,
    room: { name: b.room.name },
    date: b.date.toISOString(),
    startTime: b.startTime,
    endTime: b.endTime,
    totalAmount: Number(b.totalAmount),
    status: b.status,
  }));

  const allBookingDTOs: AllBookingDTO[] = [
    ...allClassBookings.map((b) => ({
      id: b.id,
      type: "CLASS" as const,
      userName: `${b.user.firstName} ${b.user.lastName}`,
      date: b.date.toISOString(),
      startTime: b.classSlot.startTime,
      endTime: null,
      room: { name: b.classSlot.room.name },
      amount: "1 credit",
      status: b.status,
    })),
    ...allStudioBookings.map((b) => ({
      id: b.id,
      type: "RENTAL" as const,
      userName: `${b.user.firstName} ${b.user.lastName}`,
      date: b.date.toISOString(),
      startTime: b.startTime,
      endTime: b.endTime,
      room: { name: b.room.name },
      amount: `$${Math.round(Number(b.totalAmount))}`,
      status: b.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const ownerInitials = userInitials(studio.owner.firstName ?? "S", studio.owner.lastName ?? "O");

  return (
    <DashboardClient
      studioId={studioId}
      studioName={studio.name}
      ownerInitials={ownerInitials}
      stats={stats}
      todayClasses={todayClassDTOs}
      upcomingRentals={upcomingRentalDTOs}
      rooms={roomDTOs}
      instructors={instructorDTOs}
      classSlots={classSlotDTOs}
      passPackages={passPackageDTOs}
      availabilities={availabilityDTOs}
      allBookings={allBookingDTOs}
    />
  );
}
