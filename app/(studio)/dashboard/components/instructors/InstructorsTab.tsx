"use client";

import { useState } from "react";
import type { InstructorDTO } from "@/lib/types";
import AddInstructorModal from "./AddInstructorModal";
import EditInstructorModal from "./EditInstructorModal";
import ViewInstructorModal from "./ViewInstructorModal";
import InstructorPanel from "./InstructorPanel";

type Props = { studioId: string; instructors: InstructorDTO[] };

const thCls =
  "text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100 pr-3";
const tdCls =
  "py-2.5 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 align-top pr-3";

export default function InstructorsTab({ studioId, instructors }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [viewingInstructor, setViewingInstructor] = useState<InstructorDTO | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<InstructorDTO | null>(null);

  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Instructors</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">
        Manage instructor profiles linked to your studio
      </p>

      <div className="bg-white border border-gray-100 rounded-lg p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-gray-800">
            Your instructors
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-[12px] px-3 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
          >
            + Add instructor
          </button>
        </div>
        {instructors.length === 0 ? (
          <p className="text-[13px] text-gray-400">No instructors added yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Name", "Styles", "Classes/wk", "Status", ""].map((h) => (
                  <th key={h} className={thCls}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {instructors.map((i) => (
                <InstructorPanel
                  key={i.id}
                  i={i}
                  tdCls={tdCls}
                  onView={setViewingInstructor}
                  onEdit={setEditingInstructor}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806]">
        <strong className="font-medium">Instructor profiles</strong> include
        name, bio, photo, dance styles, and social links. Students can filter
        classes by instructor.
      </div>

      <AddInstructorModal
        studioId={studioId}
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
      />

      <ViewInstructorModal
        instructor={viewingInstructor}
        isOpen={viewingInstructor !== null}
        onClose={() => setViewingInstructor(null)}
        onEdit={() => {
          setEditingInstructor(viewingInstructor);
          setViewingInstructor(null);
        }}
      />

      <EditInstructorModal
        studioId={studioId}
        instructor={editingInstructor}
        isOpen={editingInstructor !== null}
        onClose={() => setEditingInstructor(null)}
      />
    </div>
  );
}
