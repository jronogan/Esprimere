import { fmt12h } from "@/lib/functions";
import { ClassOccurrenceDTO } from "@/lib/types";

type Props = {
  o: ClassOccurrenceDTO;
  full: boolean;
  openModal: (o: ClassOccurrenceDTO) => void;
  dateLabel: (date: string) => string;
};

export default function ClassPanel({ o, full, openModal, dateLabel }: Props) {
  return (
    <div
      key={`${o.slotId}-${o.date}`}
      className={`bg-white border border-gray-100 rounded-xl overflow-hidden ${full ? "opacity-60" : "cursor-pointer hover:border-gray-200 transition"}`}
      onClick={() => !full && !o.alreadyBooked && openModal(o)}
    >
      <div className="h-[70px] bg-gray-50 border-b border-gray-100 flex items-center justify-center relative">
        <span className="text-2xl text-gray-300">♪</span>
        {full && (
          <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full bg-[#FCEBEB] border border-[#E24B4A] text-[#A32D2D] font-medium">
            Full
          </span>
        )}
        {o.alreadyBooked && !full && (
          <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full bg-[#E1F5EE] border border-[#9FE1CB] text-[#085041] font-medium">
            Booked
          </span>
        )}
        2
      </div>
      <div className="p-3">
        <p className="text-[11px] font-medium text-[#1D9E75] uppercase tracking-[0.4px] mb-1">
          {o.genre}
        </p>
        <p className="text-[13px] font-medium text-gray-900 mb-1">{o.title}</p>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {dateLabel(o.date)} · {fmt12h(o.startTime)}–{fmt12h(o.endTime)}
          <br />
          {o.room.name}
          <br />
          {o.instructor ? (
            o.instructor.name
          ) : (
            <span className="text-[#A32D2D]">No instructor</span>
          )}
        </p>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
          <p className="text-[11px] text-gray-500">
            <span className="font-medium text-gray-800">{o.bookingCount}</span>{" "}
            / {o.maxPax}
          </p>
          {o.alreadyBooked ? (
            <span className="text-[12px] text-gray-400">Booked</span>
          ) : full ? (
            <span className="text-[12px] px-3 py-1 bg-gray-100 text-gray-400 rounded-md">
              Full
            </span>
          ) : (
            <button className="text-[12px] px-3 py-1 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition">
              Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
