import type { DashboardTab } from "@/lib/types";

type MenuItem = { key: DashboardTab; label: string };
type MenuSection = { title: string; items: MenuItem[] };

export const menuSections: MenuSection[] = [
  {
    title: "Overview",
    items: [{ key: "dashboard", label: "Dashboard" }],
  },
  {
    title: "Setup",
    items: [
      { key: "rooms", label: "Rooms & spaces" },
      { key: "instructors", label: "Instructors" },
    ],
  },
  {
    title: "Classes",
    items: [
      { key: "schedule", label: "Class schedule" },
      { key: "packages", label: "Class packages" },
    ],
  },
  {
    title: "Rentals",
    items: [{ key: "availability", label: "Availability & pricing" }],
  },
  {
    title: "Bookings",
    items: [{ key: "bookings", label: "All bookings" }],
  },
];
