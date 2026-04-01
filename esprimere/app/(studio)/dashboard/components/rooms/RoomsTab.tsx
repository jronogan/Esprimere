"use client";

import { useState } from "react";
import type { RoomDTO } from "@/lib/types";
import RoomsPanel from "./RoomsPanel";
import AddRoomModal from "./AddRoomModal";
import EditRoomModal from "./EditRoomModal";
import ViewRoomModal from "./ViewRoomModal";

type Props = { studioId: string; rooms: RoomDTO[] };

export default function RoomsTab({ studioId, rooms }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [viewingRoom, setViewingRoom] = useState<RoomDTO | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);

  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Rooms & spaces</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">
        Manage your studio rooms, dimensions, and photos
      </p>

      <div className="flex flex-col gap-2.5">
        {rooms.length === 0 ? (
          <p className="text-[13px] text-gray-400">No rooms added yet.</p>
        ) : (
          rooms.map((room) => (
            <RoomsPanel
              key={room.id}
              room={room}
              onView={setViewingRoom}
              onEdit={setEditingRoom}
            />
          ))
        )}
      </div>

      <button
        onClick={() => setIsAdding(true)}
        className="mt-3 text-[12px] px-3 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
      >
        + Add room
      </button>

      <AddRoomModal
        studioId={studioId}
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
      />

      <ViewRoomModal
        room={viewingRoom}
        isOpen={viewingRoom !== null}
        onClose={() => setViewingRoom(null)}
        onEdit={() => {
          setEditingRoom(viewingRoom);
          setViewingRoom(null);
        }}
      />

      <EditRoomModal
        studioId={studioId}
        room={editingRoom}
        isOpen={editingRoom !== null}
        onClose={() => setEditingRoom(null)}
      />
    </div>
  );
}
