import type { ClassSlotDTO } from "@/lib/types";

type Props = { classSlots: ClassSlotDTO[] };

const DOW_SHORT: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

function fmt12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

const thCls = "text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100 pr-3";
const tdCls = "py-2.5 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 align-top pr-3";

export default function ScheduleTab({ classSlots }: Props) {
  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Class schedule</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">Set recurring weekly classes with instructor and room assignments</p>

      <div className="bg-white border border-gray-100 rounded-lg p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-gray-800">Weekly schedule</p>
          <button className="text-[12px] px-3 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition">
            + Add class slot
          </button>
        </div>

        {classSlots.length === 0 ? (
          <p className="text-[13px] text-gray-400">No class slots created yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Class name", "Day & time", "Room", "Instructor", "Max pax", "Booking", ""].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classSlots.map((s) => (
                <tr key={s.id}>
                  <td className={tdCls}>{s.title}</td>
                  <td className={tdCls + " text-gray-500"}>
                    {DOW_SHORT[s.dayOfWeek]} {fmt12h(s.startTime)}
                  </td>
                  <td className={tdCls + " text-gray-500"}>{s.room.name}</td>
                  <td className={`${tdCls} ${s.instructor ? "text-gray-500" : "text-[#A32D2D]"}`}>
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
                    {s.instructor ? (
                      <span className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline">Edit · Cancel</span>
                    ) : (
                      <span className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline">Assign instructor</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806]">
        <strong className="font-medium">Cancel class:</strong> All booked students are notified and credits are automatically
        refunded to their pass.
      </div>
    </div>
  );
}
