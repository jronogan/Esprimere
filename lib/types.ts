export type UserPassDTO = {
  id: string;
  creditsRemaining: number | null;
  expiresAt: string | null;
  passPackage: {
    name: string;
    credits: number | null;
    price: number;
    expiryDays: number | null;
    type: "CREDITS" | "UNLIMITED";
  };
};

export type ClassBookingDTO = {
  id: string;
  date: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  classSlot: {
    title: string;
    genre: string;
    startTime: string;
    room: { name: string };
    instructor: { name: string };
  };
};

export type StudioBookingDTO = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  room: { name: string };
};

export type PassPackageDTO = {
  id: string;
  name: string;
  credits: number | null;
  price: number;
  expiryDays: number | null;
  type: "CREDITS" | "UNLIMITED";
  isActive: boolean;
};

export type Props = {
  studioSlug: string;
  studioName: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
  };
  userPasses: UserPassDTO[];
  classBookings: ClassBookingDTO[];
  studioBookings: StudioBookingDTO[];
  passPackages: PassPackageDTO[];
};

export type ClassOccurrenceDTO = {
  slotId: string;
  title: string;
  genre: string;
  level: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  room: { name: string };
  instructor: { name: string } | null;
  maxPax: number;
  creditCost: number;
  bookingCount: number;
  alreadyBooked: boolean;
};

export type Tab = "passes" | "bookings" | "studios" | "account";
export type BookingFilter = "upcoming" | "past" | "cancelled";

// ── Dashboard (studio owner) ──────────────────────────────────────────────────

export type DashboardTab =
  | "dashboard"
  | "rooms"
  | "instructors"
  | "schedule"
  | "packages"
  | "availability"
  | "bookings";

export type DashboardStatsDTO = {
  classesThisWeek: number;
  bookingsToday: number;
  rentalsThisMonth: number;
  revenueThisMonth: number;
};

export type RoomDTO = {
  id: string;
  name: string;
  areaSqm: number | null;
  maxPax: number;
  amenities: string[];
  photos: string[];
  isActive: boolean;
};

export type InstructorDTO = {
  id: string;
  name: string;
  bio: string | null;
  styles: string[];
  photoUrl: string | null;
  isActive: boolean;
  classCount: number;
};

export type ClassSlotDTO = {
  id: string;
  title: string;
  genre: string;
  level: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxPax: number;
  creditCost: number;
  room: { id: string; name: string };
  instructor: { id: string; name: string } | null;
};

export type TodayClassDTO = {
  id: string;
  title: string;
  startTime: string;
  room: { name: string };
  instructor: { name: string } | null;
  overrideInstructor: { name: string } | null;
  maxPax: number;
  bookingCount: number;
};

export type UpcomingRentalDTO = {
  id: string;
  renterName: string;
  room: { name: string };
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
};

export type StudioAvailabilityDTO = {
  id: string;
  roomId: string;
  roomName: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  hourlyRate: number;
  bookingMode: string;
};

export type AllBookingDTO = {
  id: string;
  type: "CLASS" | "RENTAL";
  userName: string;
  date: string;
  startTime: string;
  endTime: string | null;
  room: { name: string };
  amount: string;
  status: string;
};
