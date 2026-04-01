"use client";

import { useState } from "react";
import { Props, Tab } from "@/lib/types";
import { userInitials } from "@/lib/functions";
import StudioNav from "@/components/StudioNav";
import ProfileSidebar from "./components/ProfileSidebar";
import PassesTab from "./components/PassesTab";
import BookingsTab from "./components/BookingsTab";
import StudioRentalsTab from "./components/StudioRentalsTab";
import AccountTab from "./components/AccountTab";

export default function UserProfileClient({
  studioSlug,
  studioName,
  user,
  userPasses,
  classBookings,
  studioBookings,
  passPackages,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("passes");

  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav
        studioSlug={studioSlug}
        studioName={studioName}
        userInitials={userInitials(user.firstName, user.lastName)}
      />

      <div className="flex min-h-[calc(100vh-52px)]">
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="flex-1 p-6">
          {activeTab === "passes" && (
            <PassesTab userPasses={userPasses} passPackages={passPackages} />
          )}
          {activeTab === "bookings" && (
            <BookingsTab classBookings={classBookings} />
          )}
          {activeTab === "studios" && (
            <StudioRentalsTab studioBookings={studioBookings} />
          )}
          {activeTab === "account" && (
            <AccountTab user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
