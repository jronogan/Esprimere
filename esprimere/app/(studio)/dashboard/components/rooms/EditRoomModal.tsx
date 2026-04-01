"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateRoom } from "@/actions/studio/updateRoom";
import type { RoomDTO } from "@/lib/types";

type Props = {
  studioId: string;
  room: RoomDTO | null;
  isOpen: boolean;
  onClose: () => void;
};

const inputCls =
  "w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE] placeholder:text-gray-400";
const labelCls = "block text-[12px] font-medium text-gray-500 mb-1.5";

export default function EditRoomModal({ studioId, room, isOpen, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [maxPax, setMaxPax] = useState("");
  const [amenities, setAmenities] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (room) {
      setName(room.name);
      setAreaSqm(room.areaSqm != null ? String(room.areaSqm) : "");
      setMaxPax(String(room.maxPax));
      setAmenities(room.amenities.join(", "));
      setIsActive(room.isActive);
      setError(null);
    }
  }, [room]);

  if (!isOpen || !room) return null;

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateRoom({
        roomId: room!.id,
        studioId,
        data: {
          name,
          areaSqm: areaSqm ? parseFloat(areaSqm) : undefined,
          maxPax: parseInt(maxPax),
          amenities: amenities.split(",").map((s) => s.trim()).filter(Boolean),
          isActive,
        },
      });
      router.refresh();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[440px] p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-gray-900">Edit room</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>
              Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>Area (m²)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                placeholder="e.g. 80"
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>
                Max capacity <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                value={maxPax}
                onChange={(e) => setMaxPax(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Amenities</label>
            <input
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="e.g. Mirrors, Sound system, AC"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">Comma-separated</p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-[12px] font-medium text-gray-700">Active</p>
              <p className="text-[11px] text-gray-400">Room is available for booking</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isActive ? "bg-[#1D9E75]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
