"use client";

import type { RoomDTO } from "@/lib/types";

type Props = {
  room: RoomDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
};

export default function ViewRoomModal({ room, isOpen, onClose, onEdit }: Props) {
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[440px] p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-gray-900">Room details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] flex items-center justify-center text-[15px] font-medium text-[#085041]">
            {room.name.charAt(0)}
          </div>
          <div>
            <p className="text-[15px] font-medium text-gray-900">{room.name}</p>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border ${
                room.isActive
                  ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {room.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-6">
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Area</p>
              <p className="text-[13px] text-gray-700">
                {room.areaSqm != null ? `${room.areaSqm} m²` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Max capacity</p>
              <p className="text-[13px] text-gray-700">{room.maxPax} pax</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Amenities</p>
            <p className="text-[13px] text-gray-700">
              {room.amenities.length > 0 ? room.amenities.join(", ") : "—"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Photos</p>
            <p className="text-[13px] text-gray-700">
              {room.photos.length > 0 ? `${room.photos.length} uploaded` : "No photos yet"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
          >
            Edit room
          </button>
        </div>
      </div>
    </div>
  );
}
