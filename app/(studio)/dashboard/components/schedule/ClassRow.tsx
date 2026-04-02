"use client";

import { DOW_SHORT } from "@/lib/constants";
import { fmt12h } from "@/lib/functions";
import { ClassSlotDTO } from "@/lib/types";

type Props = {
  s: ClassSlotDTO;
  tdCls: string;
  onEdit: (s: ClassSlotDTO) => void;
  onCancel: (s: ClassSlotDTO) => void;
  onManage: (s: ClassSlotDTO) => void;
};

export default function ClassRow({ s, tdCls, onEdit, onCancel, onManage }: Props) {
  return (
    <tr key={s.id}>
      <td className={tdCls}>{s.title}</td>
      <td className={tdCls + " text-gray-500"}>
        {DOW_SHORT[s.dayOfWeek]} {fmt12h(s.startTime)}
      </td>
      <td className={tdCls + " text-gray-500"}>{s.room.name}</td>
      <td
        className={`${tdCls} ${s.instructor ? "text-gray-500" : "text-[#A32D2D]"}`}
      >
        {s.instructor?.name ?? "Unassigned"}
      </td>
      <td className={tdCls + " text-gray-500"}>{s.maxPax}</td>
      <td className={tdCls}>
        {s.instructor ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full border bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]">
            Open
          </span>
        ) : (
          <span className="text-[11px] px-2 py-0.5 rounded-full border bg-[#FAEEDA] text-[#633806] border-[#EF9F27]">
            Blocked
          </span>
        )}
      </td>
      <td className={tdCls}>
        <span
          onClick={() => onEdit(s)}
          className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline"
        >
          Edit
        </span>
        <span className="text-gray-300 mx-1">·</span>
        <span
          onClick={() => onManage(s)}
          className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline"
        >
          Manage
        </span>
        <span className="text-gray-300 mx-1">·</span>
        <span
          onClick={() => onCancel(s)}
          className="text-[12px] text-red-400 cursor-pointer hover:underline"
        >
          Cancel
        </span>
      </td>
    </tr>
  );
}
