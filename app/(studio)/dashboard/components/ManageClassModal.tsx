"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelClassDate } from "@/actions/studio/cancelClassDate";
import { replaceInstructor } from "@/actions/studio/replaceInstructor";
import type { InstructorDTO } from "@/lib/types";

type Slot = { id: string; title: string };

type Props = {
  studioId: string;
  slot: Slot | null;
  date: Date | null;
  instructors: InstructorDTO[];
  isOpen: boolean;
  onClose: () => void;
};

const inputCls =
  "w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE] placeholder:text-gray-400";
const labelCls = "block text-[12px] font-medium text-gray-500 mb-1.5";

type Mode = "menu" | "replace" | "cancel";

export default function ManageClassModal({ studioId, slot, date, instructors, isOpen, onClose }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("menu");
  const [selectedDate, setSelectedDate] = useState("");
  const [replacementInstructorId, setReplacementInstructorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !slot) return null;

  // If date is provided (from OverviewTab), use it directly.
  // If not (from ScheduleTab), the user picks a date.
  const resolvedDate = date ?? (selectedDate ? new Date(selectedDate) : null);

  function handleClose() {
    setMode("menu");
    setSelectedDate("");
    setReplacementInstructorId("");
    setError(null);
    onClose();
  }

  async function handleReplace() {
    if (!resolvedDate) { setError("Please select a date."); return; }
    if (!replacementInstructorId) { setError("Please select an instructor."); return; }
    setError(null);
    setLoading(true);
    try {
      await replaceInstructor({ studioId, classSlotId: slot!.id, date: resolvedDate, replacementInstructorId });
      router.refresh();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!resolvedDate) { setError("Please select a date."); return; }
    setError(null);
    setLoading(true);
    try {
      await cancelClassDate({ studioId, classSlotId: slot!.id, date: resolvedDate });
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

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[400px] p-6 mx-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-medium text-gray-900">Manage class</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>
        <p className="text-[12px] text-gray-400 mb-5">{slot.title}</p>

        {/* Date picker — only shown when date isn't pre-supplied (ScheduleTab flow) */}
        {!date && (
          <div className="mb-4">
            <label className={labelCls}>Date <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={inputCls}
            />
          </div>
        )}

        {mode === "menu" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setMode("replace")}
              className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 text-[13px] text-gray-700 hover:bg-gray-50 transition"
            >
              <p className="font-medium">Replace instructor</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Assign a different instructor for this date only</p>
            </button>
            <button
              onClick={() => setMode("cancel")}
              className="w-full text-left px-4 py-3 rounded-lg border border-red-100 text-[13px] text-red-600 hover:bg-red-50 transition"
            >
              <p className="font-medium">Cancel this date</p>
              <p className="text-[11px] text-red-400 mt-0.5">Cancel all bookings and refund credits</p>
            </button>
          </div>
        )}

        {mode === "replace" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelCls}>Replacement instructor <span className="text-red-400">*</span></label>
              <select
                value={replacementInstructorId}
                onChange={(e) => setReplacementInstructorId(e.target.value)}
                className={inputCls}
              >
                <option value="">Select an instructor</option>
                {instructors.filter((i) => i.isActive).map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setMode("menu"); setError(null); }}
                className="px-4 py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleReplace}
                disabled={loading}
                className="px-4 py-2 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition"
              >
                {loading ? "Saving..." : "Confirm replacement"}
              </button>
            </div>
          </div>
        )}

        {mode === "cancel" && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] text-gray-600">
              All future bookings for this date will be cancelled and credits refunded.
            </p>
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setMode("menu"); setError(null); }}
                className="px-4 py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-[13px] bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition"
              >
                {loading ? "Cancelling..." : "Cancel this date"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
