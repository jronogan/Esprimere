"use client";

import { useState } from "react";
import type {
  DashboardTab,
  DashboardStatsDTO,
  TodayClassDTO,
  UpcomingRentalDTO,
  RoomDTO,
  InstructorDTO,
  ClassSlotDTO,
  PassPackageDTO,
  StudioAvailabilityDTO,
  AllBookingDTO,
} from "@/lib/types";

import DashboardNav from "./components/DashboardNav";
import DashboardSidebar from "./components/DashboardSidebar";
import OverviewTab from "./components/OverviewTab";
import RoomsTab from "./components/rooms/RoomsTab";
import InstructorsTab from "./components/instructors/InstructorsTab";
import ScheduleTab from "./components/schedule/ScheduleTab";
import PackagesTab from "./components/packages/PackagesTab";
import AvailabilityTab from "./components/availability/AvailabilityTab";
import AllBookingsTab from "./components/bookings/AllBookingsTab";

type Props = {
  studioId: string;
  studioName: string;
  ownerInitials: string;
  stats: DashboardStatsDTO;
  todayClasses: TodayClassDTO[];
  upcomingRentals: UpcomingRentalDTO[];
  rooms: RoomDTO[];
  instructors: InstructorDTO[];
  classSlots: ClassSlotDTO[];
  passPackages: PassPackageDTO[];
  availabilities: StudioAvailabilityDTO[];
  allBookings: AllBookingDTO[];
};

export default function DashboardClient({
  studioId,
  studioName,
  ownerInitials,
  stats,
  todayClasses,
  upcomingRentals,
  rooms,
  instructors,
  classSlots,
  passPackages,
  availabilities,
  allBookings,
}: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNav studioName={studioName} ownerInitials={ownerInitials} />
      <div className="flex flex-1">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && (
            <OverviewTab
              studioId={studioId}
              studioName={studioName}
              stats={stats}
              todayClasses={todayClasses}
              upcomingRentals={upcomingRentals}
              instructors={instructors}
            />
          )}
          {activeTab === "rooms" && <RoomsTab studioId={studioId} rooms={rooms} />}
          {activeTab === "instructors" && <InstructorsTab studioId={studioId} instructors={instructors} />}
          {activeTab === "schedule" && <ScheduleTab studioId={studioId} classSlots={classSlots} rooms={rooms} instructors={instructors} />}
          {activeTab === "packages" && <PackagesTab studioId={studioId} passPackages={passPackages} />}
          {activeTab === "availability" && (
            <AvailabilityTab studioId={studioId} availabilities={availabilities} rooms={rooms} />
          )}
          {activeTab === "bookings" && <AllBookingsTab bookings={allBookings} />}
        </main>
      </div>
    </div>
  );
}
