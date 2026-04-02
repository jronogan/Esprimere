"use client";

import { useState } from "react";
import { ClassBookingDTO, BookingFilter } from "@/lib/types";
import { formatDate, isUpcoming } from "@/lib/functions";
import BookingItem from "./BookingItem";

type Props = {
  classBookings: ClassBookingDTO[];
};

export default function BookingsTab({ classBookings }: Props) {
  const [filter, setFilter] = useState<BookingFilter>("upcoming");

  const filtered = classBookings.filter((b) => {
    if (filter === "cancelled") return b.status === "CANCELLED";
    if (filter === "past") return b.status !== "CANCELLED" && !isUpcoming(b.date);
    return b.status !== "CANCELLED" && isUpcoming(b.date);
  });

  return (
    <div>
      <h2 className="text-[15px] font-medium text-gray-900 mb-3">Booked classes</h2>

      <div className="flex gap-3 mb-4">
        {(["upcoming", "past", "cancelled"] as BookingFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[12px] px-3 py-1 rounded-full border transition capitalize ${
              filter === f
                ? "bg-[#E1F5EE] text-[#085041] border-[#1D9E75]"
                : "text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-[13px] text-gray-400">No {filter} bookings.</p>
        )}
        {filtered.map((b) => (
          <BookingItem
            key={b.id}
            title={`${b.classSlot.title} — ${b.classSlot.genre}`}
            meta={[
              `${formatDate(b.date)} · ${b.classSlot.startTime} · ${b.classSlot.room.name} · ${b.classSlot.instructor.name}`,
            ]}
            status={b.status}
            date={b.date}
            completedLabel="Attended"
          />
        ))}
      </div>
    </div>
  );
}
