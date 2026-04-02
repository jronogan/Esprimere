"use client";

import type { InstructorDTO } from "@/lib/types";

type Props = {
  i: InstructorDTO;
  tdCls: string;
  onView: (instructor: InstructorDTO) => void;
  onEdit: (instructor: InstructorDTO) => void;
};

export default function InstructorPanel({ i, tdCls, onView, onEdit }: Props) {
  return (
    <tr onClick={() => onView(i)} className="cursor-pointer hover:bg-gray-50 transition-colors">
      <td className={tdCls}>
        <strong className="font-medium">{i.name}</strong>
      </td>
      <td className={tdCls + " text-gray-500"}>{i.styles.join(", ") || "—"}</td>
      <td className={tdCls + " text-gray-500"}>{i.classCount}</td>
      <td className={tdCls}>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full border ${
            i.isActive
              ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
              : "bg-gray-100 text-gray-500 border-gray-200"
          }`}
        >
          {i.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className={tdCls}>
        <span
          onClick={(e) => { e.stopPropagation(); onEdit(i); }}
          className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline"
        >
          Edit profile
        </span>
      </td>
    </tr>
  );
}
