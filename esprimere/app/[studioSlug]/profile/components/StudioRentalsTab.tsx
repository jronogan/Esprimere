import { StudioBookingDTO } from "@/lib/types";
import { formatDate } from "@/lib/functions";
import BookingItem from "./BookingItem";

type Props = {
  studioBookings: StudioBookingDTO[];
};

export default function StudioRentalsTab({ studioBookings }: Props) {
  return (
    <div>
      <h2 className="text-[15px] font-medium text-gray-900 mb-3">Studio rentals</h2>

      <div className="flex flex-col gap-2">
        {studioBookings.length === 0 && (
          <p className="text-[13px] text-gray-400">No studio rentals yet.</p>
        )}
        {studioBookings.map((b) => (
          <BookingItem
            key={b.id}
            title={b.room.name}
            meta={[
              `${formatDate(b.date)} · ${b.startTime} – ${b.endTime}`,
              `Total: $${b.totalAmount.toFixed(2)}`,
            ]}
            status={b.status}
            date={b.date}
            completedLabel="Completed"
          />
        ))}
      </div>
    </div>
  );
}
