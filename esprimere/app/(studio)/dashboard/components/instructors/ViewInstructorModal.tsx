"use client";

import type { InstructorDTO } from "@/lib/types";

type Props = {
  instructor: InstructorDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
};

export default function ViewInstructorModal({ instructor, isOpen, onClose, onEdit }: Props) {
  if (!isOpen || !instructor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[440px] p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-gray-900">Instructor profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          {instructor.photoUrl ? (
            <img src={instructor.photoUrl} alt={instructor.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[18px] font-medium text-[#085041]">
              {instructor.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-[15px] font-medium text-gray-900">{instructor.name}</p>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
              instructor.isActive
                ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}>
              {instructor.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Dance styles</p>
            <p className="text-[13px] text-gray-700">
              {instructor.styles.length > 0 ? instructor.styles.join(", ") : "—"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Bio</p>
            <p className="text-[13px] text-gray-700">{instructor.bio || "—"}</p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Classes per week</p>
            <p className="text-[13px] text-gray-700">{instructor.classCount}</p>
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
            Edit profile
          </button>
        </div>
      </div>
    </div>
  );
}
