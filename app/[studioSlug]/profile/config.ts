import { Tab } from "@/lib/types";

export type MenuItem = {
  key: Tab;
  label: string;
};

export const menuItems: MenuItem[] = [
  { key: "passes", label: "My passes" },
  { key: "bookings", label: "Booked classes" },
  { key: "studios", label: "Studio rentals" },
  { key: "account", label: "Account settings" },
];
