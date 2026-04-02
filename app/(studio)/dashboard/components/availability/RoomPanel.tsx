"use client";

import { DOW_ORDER, DOW_SHORT } from "@/lib/constants";
import { fmt12h } from "@/lib/functions";
import { RoomDTO, StudioAvailabilityDTO } from "@/lib/types";

type Props = {
  room: RoomDTO;
  settings: StudioAvailabilityDTO[];
  tableHeaders: string[];
  onEdit: (room: RoomDTO) => void;
};

export function RoomPanel({ room, settings, tableHeaders, onEdit }: Props) {
  return (
    <div
      key={room.id}
      className="bg-white border border-gray-100 rounded-lg p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-medium text-gray-800">
          {room.name} — Rental settings
        </p>
        <button
          onClick={() => onEdit(room)}
          className="text-[12px] px-3 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
        >
          Edit settings
        </button>
      </div>

      {settings.length === 0 ? (
        <p className="text-[13px] text-gray-400">
          No availability set for this room.
        </p>
      ) : (
        <>
          {/* Available days chips */}
          <div className="mb-3">
            <p className="text-[12px] font-medium text-gray-500 mb-1.5">
              Available days
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {DOW_ORDER.map((dow) => {
                const active = settings.some((s) => s.dayOfWeek === dow);
                return (
                  <span
                    key={dow}
                    className={`text-[12px] px-2.5 py-1 rounded-full border ${
                      active
                        ? "bg-[#E1F5EE] text-[#085041] border-[#1D9E75]"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}
                  >
                    {DOW_SHORT[dow]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Per-day breakdown */}
          <table className="w-full border-collapse mt-3">
            <thead>
              <tr>
                {tableHeaders.map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100 pr-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 pr-4">
                    {DOW_SHORT[s.dayOfWeek]}
                  </td>
                  <td className="py-2 border-b border-gray-100 last:border-0 text-[13px] text-gray-500 pr-4">
                    {fmt12h(s.openTime)}
                  </td>
                  <td className="py-2 border-b border-gray-100 last:border-0 text-[13px] text-gray-500 pr-4">
                    {fmt12h(s.closeTime)}
                  </td>
                  <td className="py-2 border-b border-gray-100 last:border-0 text-[13px] text-gray-500 pr-4">
                    ${s.hourlyRate.toFixed(0)}/hr
                  </td>
                  <td className="py-2 border-b border-gray-100 last:border-0 text-[13px] pr-4">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        s.bookingMode === "OPEN"
                          ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
                          : "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]"
                      }`}
                    >
                      {s.bookingMode === "OPEN"
                        ? "Open booking"
                        : "Application required"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
