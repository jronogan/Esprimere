"use client";

import { useState } from "react";
import type { AllBookingDTO } from "@/lib/types";
import { fmt12h, formatDate, isUpcoming } from "@/lib/functions";

type Props = { bookings: AllBookingDTO[] };
type Filter = "all" | "classes" | "rentals" | "upcoming" | "past";

function statusBadge(status: string) {
  if (status === "CONFIRMED")
    return "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]";
  if (status === "CANCELLED")
    return "bg-[#FCEBEB] text-[#A32D2D] border-[#F09595]";
  if (status === "PENDING")
    return "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]";
  return "bg-gray-100 text-gray-500 border-gray-200";
}

const thCls =
  "text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100 pr-3 py-3";
const tdCls =
  "py-2.5 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 align-top pr-3";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "classes", label: "Classes" },
  { key: "rentals", label: "Studio rentals" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export default function AllBookingsTab({ bookings }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = bookings.filter((b) => {
    if (filter === "classes") return b.type === "CLASS";
    if (filter === "rentals") return b.type === "RENTAL";
    if (filter === "upcoming")
      return isUpcoming(b.date) && b.status !== "CANCELLED";
    if (filter === "past")
      return !isUpcoming(b.date) && b.status !== "CANCELLED";
    return true;
  });

  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">All bookings</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-4">
        Class and studio rental bookings across all rooms
      </p>

      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-[12px] px-3 py-1 rounded-full border transition ${
              filter === f.key
                ? "bg-[#E1F5EE] text-[#085041] border-[#1D9E75]"
                : "text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-[13px] text-gray-400 p-5">
            No {filter === "all" ? "" : filter} bookings found.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="px-5">
                {[
                  "Name",
                  "Type",
                  "Date & time",
                  "Room",
                  "Amount",
                  "Status",
                ].map((h) => (
                  <th key={h} className={`${thCls} first:pl-5`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className={tdCls + " pl-5"}>{b.userName}</td>
                  <td className={tdCls}>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
                      {b.type === "CLASS" ? "Class" : "Rental"}
                    </span>
                  </td>
                  <td className={tdCls + " text-gray-500"}>
                    {formatDate(b.date)} · {fmt12h(b.startTime)}
                    {b.endTime ? `–${fmt12h(b.endTime)}` : ""}
                  </td>
                  <td className={tdCls + " text-gray-500"}>{b.room.name}</td>
                  <td className={tdCls + " text-gray-500"}>{b.amount}</td>
                  <td className={tdCls}>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${statusBadge(b.status)}`}
                    >
                      {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
