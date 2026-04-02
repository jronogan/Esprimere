"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClassSlot } from "@/actions/studio/deleteClassSlot";
import type { ClassSlotDTO } from "@/lib/types";

type Props = {
  studioId: string;
  slot: ClassSlotDTO | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function CancelClassModal({ studioId, slot, isOpen, onClose }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !slot) return null;

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      await deleteClassSlot({ classSlotId: slot!.id, studioId });
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium text-gray-900">Cancel class slot</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>

        <p className="text-[13px] text-gray-600 mb-1">
          Are you sure you want to cancel <strong>{slot.title}</strong>?
        </p>
        <p className="text-[12px] text-gray-400 mb-5">
          All future bookings will be cancelled and credits automatically refunded to students.
        </p>

        {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
          >
            Keep class
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-[13px] bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition"
          >
            {loading ? "Cancelling..." : "Cancel class"}
          </button>
        </div>
      </div>
    </div>
  );
}
