import { isUpcoming } from "@/lib/functions";

type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type Props = {
  title: string;
  meta: string[];
  status: Status;
  date: string;
  completedLabel?: string; // e.g. "Attended" for classes, "Completed" for rentals
  onCancel?: () => void;
};

export default function BookingItem({
  title,
  meta,
  status,
  date,
  completedLabel = "Completed",
  onCancel,
}: Props) {
  const upcoming = status !== "CANCELLED" && isUpcoming(date);
  const cancelled = status === "CANCELLED";

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl px-4 py-3 grid grid-cols-[1fr_auto] gap-3 ${
        upcoming ? "border-l-[3px] border-l-[#1D9E75] rounded-l-none" : ""
      } ${cancelled ? "opacity-50 line-through" : ""}`}
    >
      <div>
        <div className="text-[13px] font-medium text-gray-900 mb-0.5">{title}</div>
        {meta.map((line, i) => (
          <div key={i} className="text-[12px] text-gray-500 leading-relaxed">
            {line}
          </div>
        ))}
        {upcoming && onCancel && (
          <button onClick={onCancel} className="text-[11px] text-red-600 mt-1">
            Cancel booking
          </button>
        )}
      </div>

      <span
        className={`self-start text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap border ${
          cancelled
            ? "bg-red-50 text-red-700 border-red-200"
            : upcoming
              ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
              : "bg-gray-100 text-gray-500 border-gray-200"
        }`}
      >
        {cancelled ? "Cancelled" : upcoming ? "Upcoming" : completedLabel}
      </span>
    </div>
  );
}
