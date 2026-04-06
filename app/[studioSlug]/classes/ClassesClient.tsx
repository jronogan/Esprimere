"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StudioNav from "@/components/StudioNav";
import { fmt12h } from "@/lib/functions";
import { bookClass } from "@/actions/bookings/bookClass";
import type {
  ClassOccurrenceDTO,
  UserPassDTO,
  PassPackageDTO,
} from "@/lib/types";
import ClassSideBar from "./ClassSideBar";
import ClassPanel from "./ClassPanel";
import BookingModal from "./BookingModal";

type Props = {
  studioId: string;
  studioSlug: string;
  studioName: string;
  userInitials: string;
  userEmail: string;
  occurrences: ClassOccurrenceDTO[];
  userPasses: UserPassDTO[];
  passPackages: PassPackageDTO[];
};

const GENRES = [
  "All",
  "Hip-hop",
  "Ballet",
  "Jazz",
  "K-pop",
  "Contemporary",
  "Latin",
  "Ballroom",
];
const DAYS = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["All", "Morning", "Afternoon", "Evening"];
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

function timeOfDay(t: string) {
  const [h] = t.split(":").map(Number);
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function shortDay(dow: string) {
  return dow.charAt(0) + dow.slice(1, 3).toLowerCase(); // "MONDAY" → "Mon"
}

function dateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const base = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  if (diff === 0) return `Today · ${base}`;
  if (diff === 1) return `Tomorrow · ${base}`;
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })} · ${base}`;
}

export default function ClassesClient({
  studioId,
  studioSlug,
  studioName,
  userInitials,
  userEmail,
  occurrences,
  userPasses,
  passPackages,
}: Props) {
  const router = useRouter();

  // Filters
  const [genre, setGenre] = useState("All");
  const [day, setDay] = useState("All");
  const [time, setTime] = useState("All");
  const [level, setLevel] = useState("All");

  // Booking modal
  const [selected, setSelected] = useState<ClassOccurrenceDTO | null>(null);
  const [selectedPassId, setSelectedPassId] = useState<string>("");
  const [buyingPackageId, setBuyingPackageId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Confirmation
  const [confirmed, setConfirmed] = useState<ClassOccurrenceDTO | null>(null);
  const [confirmedPassName, setConfirmedPassName] = useState("");

  const filtered = occurrences.filter((o) => {
    if (genre !== "All" && o.genre.toLowerCase() !== genre.toLowerCase())
      return false;
    if (day !== "All" && shortDay(o.dayOfWeek) !== day) return false;
    if (time !== "All" && timeOfDay(o.startTime) !== time) return false;
    if (level !== "All" && o.level.toLowerCase() !== level.toLowerCase())
      return false;
    return true;
  });

  const validPasses = userPasses.filter((p) => {
    if (p.expiresAt && new Date(p.expiresAt) < new Date()) return false;
    if (
      p.passPackage.type === "CREDITS" &&
      (p.creditsRemaining ?? 0) < (selected?.creditCost ?? 1)
    )
      return false;
    return true;
  });

  function openModal(o: ClassOccurrenceDTO) {
    setSelected(o);
    setSelectedPassId(validPasses[0]?.id ?? "");
    setBuyingPackageId("");
    setError(null);
  }

  function closeModal() {
    setSelected(null);
    setError(null);
  }

  async function handleBook() {
    if (!selected) return;
    if (!selectedPassId) {
      setError("Select a pass to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await bookClass({
        classSlotId: selected.slotId,
        date: new Date(selected.date),
        studioId,
        userPassId: selectedPassId,
      });
      const pass = userPasses.find((p) => p.id === selectedPassId);
      setConfirmed(selected);
      setConfirmedPassName(pass?.passPackage.name ?? "");
      setSelected(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudioNav
          studioSlug={studioSlug}
          studioName={studioName}
          userInitials={userInitials}
        />
        <div className="p-8 flex justify-center">
          <div className="bg-white border border-gray-100 rounded-xl p-8 w-full max-w-[400px] text-center">
            <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1D9E75"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[16px] font-medium text-gray-900 mb-1">
              Booking confirmed!
            </p>
            <p className="text-[13px] text-gray-500 mb-6">
              A confirmation has been sent to {userEmail}
            </p>

            <div className="text-left mb-6">
              {[
                ["Class", confirmed.title],
                [
                  "Date & time",
                  `${dateLabel(confirmed.date)}, ${fmt12h(confirmed.startTime)}`,
                ],
                ["Room", confirmed.room.name],
                ["Instructor", confirmed.instructor?.name ?? "TBC"],
                [
                  "Payment",
                  `${confirmed.creditCost} credit (${confirmedPassName})`,
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between text-[13px] py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-500">{k}</span>
                  <span className="text-gray-900">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setConfirmed(null)}
                className="w-full py-2 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
              >
                Browse more classes
              </button>
              <button
                onClick={() => router.push(`/${studioSlug}/profile`)}
                className="w-full py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
              >
                View my bookings
              </button>
            </div>

            <div className="mt-4 bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806] text-left">
              <strong className="font-medium">Reminder:</strong> Cancel before
              24 hrs for a full credit refund.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav
        studioSlug={studioSlug}
        studioName={studioName}
        userInitials={userInitials}
      />

      <div className="flex min-h-[calc(100vh-52px)]">
        {/* Sidebar filters */}
        <ClassSideBar
          GENRES={GENRES}
          setGenre={setGenre}
          DAYS={DAYS}
          setDay={setDay}
          TIMES={TIMES}
          setTime={setTime}
          LEVELS={LEVELS}
          setLevel={setLevel}
          genre={genre}
          day={day}
          time={time}
          level={level}
        />
        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-gray-500">
              {filtered.length} class{filtered.length !== 1 ? "es" : ""}{" "}
              available · up to 3 days ahead
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-[13px] text-gray-400">
              No classes match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {filtered.map((o) => {
                const full = o.bookingCount >= o.maxPax;
                return (
                  <ClassPanel
                    key={`${o.slotId}-${o.date}`}
                    o={o}
                    full={full}
                    openModal={openModal}
                    dateLabel={dateLabel}
                  />
                );
              })}
            </div>
          )}

          <div className="mt-4 bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806]">
            <strong className="font-medium">Booking window:</strong> Only
            classes within the next 3 days are shown. Classes &lt;24hrs away
            lock cancellation automatically.
          </div>
        </main>
      </div>

      {/* Booking modal */}
      {selected && (
        <BookingModal
          selected={selected}
          validPasses={validPasses}
          passPackages={passPackages}
          selectedPassId={selectedPassId}
          buyingPackageId={buyingPackageId}
          error={error}
          loading={loading}
          dateLabel={dateLabel}
          setSelectedPassId={setSelectedPassId}
          setBuyingPackageId={setBuyingPackageId}
          onClose={closeModal}
          onConfirm={handleBook}
        />
      )}
    </div>
  );
}
