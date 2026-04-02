import "dotenv/config";
import {
  Role,
  DayOfWeek,
  BookingMode,
  PassType,
  ClassLevel,
} from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

async function main() {
  console.log("Seeding database...");

  const ownerPass = await bcrypt.hash("password123", 12);
  const studentPass = await bcrypt.hash("password123", 12);

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDIO 1 — Esprimere Dance Studio
  // ─────────────────────────────────────────────────────────────────────────────

  const owner1 =
    (await prisma.user.findFirst({
      where: { email: "sarah@esprimere.com", studioId: null },
    })) ??
    (await prisma.user.create({
      data: {
        email: "sarah@esprimere.com",
        firstName: "Sarah",
        lastName: "Tan",
        password: ownerPass,
        role: Role.STUDIO_OWNER,
      },
    }));

  const studio1 = await prisma.studio.upsert({
    where: { slug: "esprimere-dance" },
    update: {},
    create: {
      ownerId: owner1.id,
      name: "Esprimere Dance Studio",
      slug: "esprimere-dance",
      description: "A contemporary dance studio in the heart of the city.",
      brandColor: "#6D28D9",
      isLive: true,
    },
  });

  // Students for studio 1
  const s1Students = [
    { email: "jamie@example.com", firstName: "Jamie", lastName: "Lee" },
    { email: "priya@example.com", firstName: "Priya", lastName: "Nair" },
    { email: "alex@example.com", firstName: "Alex", lastName: "Wong" },
  ];

  for (const s of s1Students) {
    (await prisma.user.findFirst({
      where: { email: s.email, studioId: studio1.id },
    })) ??
      (await prisma.user.create({
        data: {
          ...s,
          password: studentPass,
          role: Role.STUDENT,
          studioId: studio1.id,
          dateOfBirth: new Date("1998-04-12"),
        },
      }));
  }

  // Rooms
  const s1Room1 = await prisma.room.upsert({
    where: { id: "s1-room-main" },
    update: {},
    create: {
      id: "s1-room-main",
      studioId: studio1.id,
      name: "Main Hall",
      areaSqm: 80,
      maxPax: 20,
      amenities: ["Mirror wall", "Sound system", "Air conditioning", "Sprung floor"],
      photos: [],
    },
  });

  const s1Room2 = await prisma.room.upsert({
    where: { id: "s1-room-b" },
    update: {},
    create: {
      id: "s1-room-b",
      studioId: studio1.id,
      name: "Studio B",
      areaSqm: 40,
      maxPax: 10,
      amenities: ["Mirror wall", "Sound system", "Air conditioning"],
      photos: [],
    },
  });

  // Availability (Mon–Sat, both rooms)
  const weekdays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  for (const day of weekdays) {
    await prisma.studioAvailability.upsert({
      where: { roomId_dayOfWeek: { roomId: s1Room1.id, dayOfWeek: day } },
      update: {},
      create: {
        roomId: s1Room1.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "22:00",
        hourlyRate: 80,
        bookingMode: BookingMode.INSTANT,
      },
    });

    await prisma.studioAvailability.upsert({
      where: { roomId_dayOfWeek: { roomId: s1Room2.id, dayOfWeek: day } },
      update: {},
      create: {
        roomId: s1Room2.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "22:00",
        hourlyRate: 50,
        bookingMode: BookingMode.INSTANT,
      },
    });
  }

  // Instructors
  const maya = await prisma.instructor.upsert({
    where: { id: "s1-instructor-maya" },
    update: {},
    create: {
      id: "s1-instructor-maya",
      studioId: studio1.id,
      name: "Maya Reyes",
      bio: "10 years of contemporary and jazz experience.",
      styles: ["Contemporary", "Jazz", "Lyrical"],
    },
  });

  const kai = await prisma.instructor.upsert({
    where: { id: "s1-instructor-kai" },
    update: {},
    create: {
      id: "s1-instructor-kai",
      studioId: studio1.id,
      name: "Kai Lim",
      bio: "Hip hop and breaking specialist with competition experience.",
      styles: ["Hip Hop", "Breaking", "Popping"],
    },
  });

  // Class slots
  const s1Slots = [
    {
      id: "s1-slot-contemporary-mon",
      roomId: s1Room1.id,
      instructorId: maya.id,
      title: "Foundations",
      genre: "Contemporary",
      level: ClassLevel.BEGINNER,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "19:00",
      endTime: "20:00",
      durationMins: 60,
      maxPax: 15,
      creditCost: 1,
    },
    {
      id: "s1-slot-hiphop-wed",
      roomId: s1Room1.id,
      instructorId: kai.id,
      title: "Basics",
      genre: "Hip Hop",
      level: ClassLevel.BEGINNER,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "20:00",
      endTime: "21:00",
      durationMins: 60,
      maxPax: 15,
      creditCost: 1,
    },
    {
      id: "s1-slot-jazz-sat",
      roomId: s1Room2.id,
      instructorId: maya.id,
      title: "Technique",
      genre: "Jazz",
      level: ClassLevel.INTERMEDIATE,
      dayOfWeek: DayOfWeek.SATURDAY,
      startTime: "11:00",
      endTime: "12:30",
      durationMins: 90,
      maxPax: 10,
      creditCost: 2,
    },
    {
      id: "s1-slot-hiphop-fri",
      roomId: s1Room1.id,
      instructorId: kai.id,
      title: "Advanced Crew",
      genre: "Hip Hop",
      level: ClassLevel.ADVANCED,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "20:30",
      endTime: "22:00",
      durationMins: 90,
      maxPax: 12,
      creditCost: 2,
    },
  ];

  for (const slot of s1Slots) {
    await prisma.classSlot.upsert({
      where: { id: slot.id },
      update: {},
      create: { studioId: studio1.id, ...slot },
    });
  }

  // Pass packages
  const s1Passes = [
    {
      id: "s1-pass-trial",
      name: "Trial Pass",
      credits: 1,
      price: 25,
      expiryDays: 30,
      type: PassType.CREDITS,
    },
    {
      id: "s1-pass-10",
      name: "10 Class Pass",
      credits: 10,
      price: 180,
      expiryDays: 90,
      type: PassType.CREDITS,
    },
    {
      id: "s1-pass-unlimited",
      name: "Unlimited Monthly",
      credits: null,
      price: 220,
      expiryDays: 30,
      type: PassType.UNLIMITED,
    },
  ];

  for (const p of s1Passes) {
    await prisma.passPackage.upsert({
      where: { id: p.id },
      update: {},
      create: { studioId: studio1.id, ...p },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDIO 2 — Pulse Dance Studio
  // ─────────────────────────────────────────────────────────────────────────────

  const owner2 =
    (await prisma.user.findFirst({
      where: { email: "marcus@pulsedance.com", studioId: null },
    })) ??
    (await prisma.user.create({
      data: {
        email: "marcus@pulsedance.com",
        firstName: "Marcus",
        lastName: "Yeo",
        password: ownerPass,
        role: Role.STUDIO_OWNER,
      },
    }));

  const studio2 = await prisma.studio.upsert({
    where: { slug: "pulse-dance" },
    update: {},
    create: {
      ownerId: owner2.id,
      name: "Pulse Dance Studio",
      slug: "pulse-dance",
      description: "High-energy urban dance classes for all levels.",
      brandColor: "#C2410C",
      isLive: true,
    },
  });

  // Students for studio 2
  const s2Students = [
    { email: "nina@example.com", firstName: "Nina", lastName: "Chen" },
    { email: "ryan@example.com", firstName: "Ryan", lastName: "Ong" },
    { email: "zoe@example.com", firstName: "Zoe", lastName: "Park" },
    { email: "marco@example.com", firstName: "Marco", lastName: "Silva" },
  ];

  for (const s of s2Students) {
    (await prisma.user.findFirst({
      where: { email: s.email, studioId: studio2.id },
    })) ??
      (await prisma.user.create({
        data: {
          ...s,
          password: studentPass,
          role: Role.STUDENT,
          studioId: studio2.id,
          dateOfBirth: new Date("2000-08-20"),
        },
      }));
  }

  // Rooms
  const s2Room1 = await prisma.room.upsert({
    where: { id: "s2-room-main" },
    update: {},
    create: {
      id: "s2-room-main",
      studioId: studio2.id,
      name: "Main Floor",
      areaSqm: 100,
      maxPax: 25,
      amenities: ["Mirror wall", "Sound system", "Air conditioning", "Sprung floor", "LED lighting"],
      photos: [],
    },
  });

  const s2Room2 = await prisma.room.upsert({
    where: { id: "s2-room-private" },
    update: {},
    create: {
      id: "s2-room-private",
      studioId: studio2.id,
      name: "Private Studio",
      areaSqm: 30,
      maxPax: 6,
      amenities: ["Mirror wall", "Sound system"],
      photos: [],
    },
  });

  // Availability (Tue–Sun)
  const s2Days = [
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  for (const day of s2Days) {
    await prisma.studioAvailability.upsert({
      where: { roomId_dayOfWeek: { roomId: s2Room1.id, dayOfWeek: day } },
      update: {},
      create: {
        roomId: s2Room1.id,
        dayOfWeek: day,
        openTime: "10:00",
        closeTime: "23:00",
        hourlyRate: 90,
        bookingMode: BookingMode.INSTANT,
      },
    });

    await prisma.studioAvailability.upsert({
      where: { roomId_dayOfWeek: { roomId: s2Room2.id, dayOfWeek: day } },
      update: {},
      create: {
        roomId: s2Room2.id,
        dayOfWeek: day,
        openTime: "10:00",
        closeTime: "23:00",
        hourlyRate: 60,
        bookingMode: BookingMode.INSTANT,
      },
    });
  }

  // Instructors
  const sasha = await prisma.instructor.upsert({
    where: { id: "s2-instructor-sasha" },
    update: {},
    create: {
      id: "s2-instructor-sasha",
      studioId: studio2.id,
      name: "Sasha Wolff",
      bio: "K-pop and street jazz with 8 years of performance experience.",
      styles: ["K-pop", "Street Jazz", "Commercial"],
    },
  });

  const deon = await prisma.instructor.upsert({
    where: { id: "s2-instructor-deon" },
    update: {},
    create: {
      id: "s2-instructor-deon",
      studioId: studio2.id,
      name: "Deon Hartley",
      bio: "Ballet and contemporary trained at Royal Academy.",
      styles: ["Ballet", "Contemporary", "Barre"],
    },
  });

  // Class slots
  const s2Slots = [
    {
      id: "s2-slot-kpop-tue",
      roomId: s2Room1.id,
      instructorId: sasha.id,
      title: "Choreo Drop",
      genre: "K-pop",
      level: ClassLevel.BEGINNER,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "18:00",
      endTime: "19:00",
      durationMins: 60,
      maxPax: 20,
      creditCost: 1,
    },
    {
      id: "s2-slot-ballet-thu",
      roomId: s2Room2.id,
      instructorId: deon.id,
      title: "Adult Barre",
      genre: "Ballet",
      level: ClassLevel.BEGINNER,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "10:00",
      endTime: "11:00",
      durationMins: 60,
      maxPax: 6,
      creditCost: 1,
    },
    {
      id: "s2-slot-streetjazz-sat",
      roomId: s2Room1.id,
      instructorId: sasha.id,
      title: "Street Jazz",
      genre: "Street Jazz",
      level: ClassLevel.INTERMEDIATE,
      dayOfWeek: DayOfWeek.SATURDAY,
      startTime: "14:00",
      endTime: "15:30",
      durationMins: 90,
      maxPax: 18,
      creditCost: 2,
    },
    {
      id: "s2-slot-contemporary-sun",
      roomId: s2Room1.id,
      instructorId: deon.id,
      title: "Movement Lab",
      genre: "Contemporary",
      level: ClassLevel.ADVANCED,
      dayOfWeek: DayOfWeek.SUNDAY,
      startTime: "16:00",
      endTime: "17:30",
      durationMins: 90,
      maxPax: 15,
      creditCost: 2,
    },
  ];

  for (const slot of s2Slots) {
    await prisma.classSlot.upsert({
      where: { id: slot.id },
      update: {},
      create: { studioId: studio2.id, ...slot },
    });
  }

  // Pass packages
  const s2Passes = [
    {
      id: "s2-pass-trial",
      name: "Drop-in",
      credits: 1,
      price: 30,
      expiryDays: 14,
      type: PassType.CREDITS,
    },
    {
      id: "s2-pass-5",
      name: "5 Class Pack",
      credits: 5,
      price: 120,
      expiryDays: 60,
      type: PassType.CREDITS,
    },
    {
      id: "s2-pass-unlimited",
      name: "Monthly Unlimited",
      credits: null,
      price: 250,
      expiryDays: 30,
      type: PassType.UNLIMITED,
    },
  ];

  for (const p of s2Passes) {
    await prisma.passPackage.upsert({
      where: { id: p.id },
      update: {},
      create: { studioId: studio2.id, ...p },
    });
  }

  console.log("Seeding complete.");
  console.log("");
  console.log("Studio 1 — Esprimere Dance  /esprimere-dance");
  console.log("  Owner:    sarah@esprimere.com  /  password123");
  console.log("  Students: jamie@example.com, priya@example.com, alex@example.com  /  password123");
  console.log("");
  console.log("Studio 2 — Pulse Dance Studio  /pulse-dance");
  console.log("  Owner:    marcus@pulsedance.com  /  password123");
  console.log("  Students: nina@example.com, ryan@example.com, zoe@example.com, marco@example.com  /  password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
