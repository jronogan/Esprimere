"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateClassAvailability } from "@/actions/studio/updateClassAvailability";
import { deleteClassAvailability } from "@/actions/studio/deleteClassAvailability";
import type { StudioAvailabilityDTO, RoomDTO } from "@/lib/types";
import { DOW_ORDER, DOW_SHORT } from "@/lib/constants";
import type { BookingMode, DayOfWeek } from "@/app/generated/prisma/client";

type Props = {
  studioId: string;
  room: RoomDTO | null;
  availabilities: StudioAvailabilityDTO[];
  isOpen: boolean;
  onClose: () => void;
};

const inputCls =
  "w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE] placeholder:text-gray-400";
const labelCls = "block text-[11px] font-medium text-gray-500 mb-1";

type DayConfig = {
  enabled: boolean;
  openTime: string;
  closeTime: string;
  hourlyRate: string;
  bookingMode: BookingMode;
};

function defaultConfig(): DayConfig {
  return {
    enabled: false,
    openTime: "09:00",
    closeTime: "21:00",
    hourlyRate: "",
    bookingMode: "INSTANT",
  };
}

export default function EditAvailabilityModal({
  studioId,
  room,
  availabilities,
  isOpen,
  onClose,
}: Props) {
  const router = useRouter();
  const [days, setDays] = useState<Record<string, DayConfig>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room) return;
    const initial: Record<string, DayConfig> = {};
    for (const dow of DOW_ORDER) {
      const existing = availabilities.find(
        (a) => a.roomId === room.id && a.dayOfWeek === dow,
      );
      if (existing) {
        initial[dow] = {
          enabled: true,
          openTime: existing.openTime,
          closeTime: existing.closeTime,
          hourlyRate: String(existing.hourlyRate),
          bookingMode: existing.bookingMode as BookingMode,
        };
      } else {
        initial[dow] = defaultConfig();
      }
    }
    setDays(initial);
    setError(null);
  }, [room, availabilities]);

  if (!isOpen || !room) return null;

  function update(
    dow: string,
    field: keyof DayConfig,
    value: string | boolean,
  ) {
    setDays((prev) => ({ ...prev, [dow]: { ...prev[dow], [field]: value } }));
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!room) return;
    setError(null);
    setLoading(true);
    try {
      const enabled = DOW_ORDER.filter((dow) => days[dow]?.enabled);
      if (enabled.length === 0) throw new Error("Enable at least one day.");

      const disabled = DOW_ORDER.filter(
        (dow) => !days[dow]?.enabled && availabilities.some((a) => a.roomId === room.id && a.dayOfWeek === dow)
      );

      await Promise.all([
        ...enabled.map((dow) => {
          const d = days[dow];
          if (!d.hourlyRate)
            throw new Error(`Set a hourly rate for ${DOW_SHORT[dow]}.`);
          return updateClassAvailability({
            studioId,
            roomId: room.id,
            dayOfWeek: dow as DayOfWeek,
            openTime: d.openTime,
            closeTime: d.closeTime,
            hourlyRate: parseFloat(d.hourlyRate),
            bookingMode: d.bookingMode,
          });
        }),
        ...disabled.map((dow) =>
          deleteClassAvailability({ studioId, roomId: room.id, dayOfWeek: dow as DayOfWeek })
        ),
      ]);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[560px] p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-medium text-gray-900">
            Edit availability
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
        <p className="text-[12px] text-gray-400 mb-5">{room.name}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {DOW_ORDER.map((dow) => {
            const d = days[dow];
            if (!d) return null;
            return (
              <div
                key={dow}
                className={`rounded-lg border p-3 transition ${d.enabled ? "border-gray-200" : "border-gray-100 bg-gray-50"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => update(dow, "enabled", !d.enabled)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${d.enabled ? "bg-[#1D9E75]" : "bg-gray-200"}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${d.enabled ? "translate-x-4" : "translate-x-1"}`}
                    />
                  </button>
                  <p
                    className={`text-[13px] font-medium ${d.enabled ? "text-gray-800" : "text-gray-400"}`}
                  >
                    {DOW_SHORT[dow]}
                  </p>
                </div>

                {d.enabled && (
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    <div>
                      <label className={labelCls}>Open</label>
                      <input
                        type="time"
                        value={d.openTime}
                        onChange={(e) =>
                          update(dow, "openTime", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Close</label>
                      <input
                        type="time"
                        value={d.closeTime}
                        onChange={(e) =>
                          update(dow, "closeTime", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Rate / hr ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={d.hourlyRate}
                        onChange={(e) =>
                          update(dow, "hourlyRate", e.target.value)
                        }
                        placeholder="e.g. 80"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Booking mode</label>
                      <select
                        value={d.bookingMode}
                        onChange={(e) =>
                          update(dow, "bookingMode", e.target.value)
                        }
                        className={inputCls}
                      >
                        <option value="INSTANT">Open</option>
                        <option value="REQUEST">Request</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition"
            >
              {loading ? "Saving..." : "Save availability"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
