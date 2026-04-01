"use client";

import type { RoomDTO } from "@/lib/types";

type Props = {
  room: RoomDTO;
  onView: (room: RoomDTO) => void;
  onEdit: (room: RoomDTO) => void;
};

export default function RoomsPanel({ room, onView, onEdit }: Props) {
  const photoStatus =
    room.photos.length === 0
      ? { label: "Needs photos", cls: "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]" }
      : { label: "Active", cls: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]" };

  return (
    <div
      onClick={() => onView(room)}
      className="bg-white border border-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-medium text-gray-900">{room.name}</p>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${photoStatus.cls}`}>
          {room.isActive ? photoStatus.label : "Inactive"}
        </span>
      </div>
      <p className="text-[12px] text-gray-500 leading-relaxed">
        {room.areaSqm ? `${room.areaSqm}m² · ` : ""}Max pax: {room.maxPax}
        {room.amenities.length > 0 && (
          <>
            <br />
            Amenities: {room.amenities.join(", ")}
          </>
        )}
        <br />
        Photos: {room.photos.length} uploaded
      </p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(room); }}
          className="text-[12px] px-3 py-1.5 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-100 transition"
        >
          Edit details
        </button>
      </div>
    </div>
  );
}
