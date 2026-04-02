"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClassSlot } from "@/actions/studio/createClassSlot";
import type { RoomDTO, InstructorDTO } from "@/lib/types";
import type { ClassLevel, DayOfWeek } from "@/app/generated/prisma/client";
import { calcDurationMins } from "@/lib/functions";

type Props = {
  studioId: string;
  rooms: RoomDTO[];
  instructors: InstructorDTO[];
  isOpen: boolean;
  onClose: () => void;
};

const inputCls =
  "w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE] placeholder:text-gray-400";
const labelCls = "block text-[12px] font-medium text-gray-500 mb-1.5";

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const LEVELS: ClassLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function AddClassModal({
  studioId,
  rooms,
  instructors,
  isOpen,
  onClose,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [level, setLevel] = useState<ClassLevel>("BEGINNER");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomId, setRoomId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [maxPax, setMaxPax] = useState("");
  const [creditCost, setCreditCost] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function reset() {
    setTitle("");
    setGenre("");
    setLevel("BEGINNER");
    setDayOfWeek("MONDAY");
    setStartTime("");
    setEndTime("");
    setRoomId("");
    setInstructorId("");
    setMaxPax("");
    setCreditCost("1");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    const durationMins = calcDurationMins(startTime, endTime);
    if (durationMins <= 0) {
      setError("End time must be after start time.");
      return;
    }
    setLoading(true);
    try {
      await createClassSlot({
        studioId,
        roomId,
        instructorId,
        title,
        genre,
        level,
        dayOfWeek,
        startTime,
        endTime,
        durationMins,
        maxPax: parseInt(maxPax),
        creditCost: parseInt(creditCost),
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

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[480px] p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-gray-900">
            Add class slot
          </h2>
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
              Class name <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Contemporary Foundations"
              className={inputCls}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>
                Genre <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Ballet"
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ClassLevel)}
                className={inputCls}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0) + l.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelCls}>
                Day <span className="text-red-400">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className={inputCls}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={labelCls}>
                Start <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>
                End <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Room <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={inputCls}
            >
              <option value="">Select a room</option>
              {rooms
                .filter((r) => r.isActive)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>
              Instructor <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className={inputCls}
            >
              <option value="">Select an instructor</option>
              {instructors
                .filter((i) => i.isActive)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-3">
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
                placeholder="e.g. 15"
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>
                Credit cost <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                value={creditCost}
                onChange={(e) => setCreditCost(e.target.value)}
                className={inputCls}
              />
            </div>
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
              {loading ? "Adding..." : "Add class slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
