"use client";

import { useState } from "react";
import type { ClassSlotDTO, RoomDTO, InstructorDTO } from "@/lib/types";
import ClassRow from "./ClassRow";
import AddClassModal from "./AddClassModal";
import EditClassModal from "./EditClassModal";
import CancelClassModal from "./CancelClassModal";
import ManageClassModal from "../ManageClassModal";

type Props = {
  studioId: string;
  classSlots: ClassSlotDTO[];
  rooms: RoomDTO[];
  instructors: InstructorDTO[];
};

const thCls =
  "text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100 pr-3";
const tdCls =
  "py-2.5 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 align-top pr-3";

const headerCells = [
  "Class name",
  "Day & time",
  "Room",
  "Instructor",
  "Max pax",
  "Booking",
  "",
];

export default function ScheduleTab({ studioId, classSlots, rooms, instructors }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<ClassSlotDTO | null>(null);
  const [cancelSlot, setCancelSlot] = useState<ClassSlotDTO | null>(null);
  const [manageSlot, setManageSlot] = useState<ClassSlotDTO | null>(null);

  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Class schedule</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">
        Set recurring weekly classes with instructor and room assignments
      </p>

      <div className="bg-white border border-gray-100 rounded-lg p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-gray-800">Weekly schedule</p>
          <button
            onClick={() => setAddOpen(true)}
            className="text-[12px] px-3 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
          >
            + Add class slot
          </button>
        </div>

        {classSlots.length === 0 ? (
          <p className="text-[13px] text-gray-400">No class slots created yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headerCells.map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classSlots.map((s) => (
                <ClassRow
                  key={s.id}
                  s={s}
                  tdCls={tdCls}
                  onEdit={(s) => setEditSlot(s)}
                  onManage={(s) => setManageSlot(s)}
                  onCancel={(s) => setCancelSlot(s)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806]">
        <strong className="font-medium">Cancel class:</strong> All booked
        students are notified and credits are automatically refunded to their pass.
      </div>

      <AddClassModal
        studioId={studioId}
        rooms={rooms}
        instructors={instructors}
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <EditClassModal
        studioId={studioId}
        slot={editSlot}
        rooms={rooms}
        instructors={instructors}
        isOpen={editSlot !== null}
        onClose={() => setEditSlot(null)}
      />

      <CancelClassModal
        studioId={studioId}
        slot={cancelSlot}
        isOpen={cancelSlot !== null}
        onClose={() => setCancelSlot(null)}
      />

      <ManageClassModal
        studioId={studioId}
        slot={manageSlot}
        date={null}
        instructors={instructors}
        isOpen={manageSlot !== null}
        onClose={() => setManageSlot(null)}
      />
    </div>
  );
}
