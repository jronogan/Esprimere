"use client";

import { useState } from "react";
import { DOW_ORDER } from "@/lib/constants";
import type { StudioAvailabilityDTO, RoomDTO } from "@/lib/types";
import { RoomPanel } from "./RoomPanel";
import EditAvailabilityModal from "./EditAvailabilityModal";

type Props = {
  studioId: string;
  availabilities: StudioAvailabilityDTO[];
  rooms: RoomDTO[];
};

const tableHeaders = ["Day", "Open", "Close", "Rate / hr", "Booking mode"];

export default function AvailabilityTab({ studioId, availabilities, rooms }: Props) {
  const [editRoom, setEditRoom] = useState<RoomDTO | null>(null);

  const byRoom = rooms.map((room) => ({
    room,
    settings: availabilities
      .filter((a) => a.roomId === room.id)
      .sort((a, b) => DOW_ORDER.indexOf(a.dayOfWeek) - DOW_ORDER.indexOf(b.dayOfWeek)),
  }));

  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Availability & rental pricing</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">
        Set which dates, times, and rooms are open for rental
      </p>

      <div className="flex flex-col gap-4">
        {byRoom.map(({ room, settings }) => (
          <RoomPanel
            key={room.id}
            room={room}
            settings={settings}
            tableHeaders={tableHeaders}
            onEdit={(r) => setEditRoom(r)}
          />
        ))}
      </div>

      <EditAvailabilityModal
        studioId={studioId}
        room={editRoom}
        availabilities={availabilities}
        isOpen={editRoom !== null}
        onClose={() => setEditRoom(null)}
      />
    </div>
  );
}
