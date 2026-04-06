"use client";

import { fmt12h } from "@/lib/functions";
import type { ClassOccurrenceDTO, UserPassDTO, PassPackageDTO } from "@/lib/types";
import ValidPass from "./ValidPass";
import NewPass from "./NewPass";

type Props = {
  selected: ClassOccurrenceDTO;
  validPasses: UserPassDTO[];
  passPackages: PassPackageDTO[];
  selectedPassId: string;
  buyingPackageId: string;
  error: string | null;
  loading: boolean;
  dateLabel: (iso: string) => string;
  setSelectedPassId: (id: string) => void;
  setBuyingPackageId: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function BookingModal({
  selected,
  validPasses,
  passPackages,
  selectedPassId,
  buyingPackageId,
  error,
  loading,
  dateLabel,
  setSelectedPassId,
  setBuyingPackageId,
  onClose,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[420px] p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <p className="text-[16px] font-medium text-gray-900 mb-1">
          {selected.title}
        </p>
        <p className="text-[13px] text-gray-500 mb-5">
          {dateLabel(selected.date)} · {fmt12h(selected.startTime)}–
          {fmt12h(selected.endTime)} · {selected.room.name}
          {selected.instructor && ` · ${selected.instructor.name}`}
        </p>

        <p className="text-[12px] font-medium text-gray-500 mb-2">
          Select payment method
        </p>

        {/* Existing passes */}
        {validPasses.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {validPasses.map((p) => (
              <ValidPass
                key={p.id}
                pass={p}
                creditCost={selected.creditCost}
                isSelected={selectedPassId === p.id && !buyingPackageId}
                onSelect={(id) => { setSelectedPassId(id); setBuyingPackageId(""); }}
              />
            ))}
          </div>
        )}

        {/* Buy new pass */}
        {passPackages.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mb-2">
            <p className="text-[12px] font-medium text-gray-500 mb-2">Or buy a new pass</p>
            <div className="flex flex-col gap-2">
              {passPackages.map((pkg) => (
                <NewPass
                  key={pkg.id}
                  pkg={pkg}
                  isSelected={buyingPackageId === pkg.id}
                  onSelect={(id) => { setBuyingPackageId(id); setSelectedPassId(""); }}
                />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-[12px] text-red-500 mb-2">{error}</p>}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={onClose}
            className="py-2.5 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || (!selectedPassId && !buyingPackageId)}
            className="py-2.5 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition font-medium"
          >
            {loading ? "Booking..." : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
