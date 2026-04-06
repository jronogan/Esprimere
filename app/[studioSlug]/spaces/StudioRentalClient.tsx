"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import StudioNav from "@/components/StudioNav";
import { fmt12h } from "@/lib/functions";
import { bookStudio } from "@/actions/bookings/bookStudio";
import { url } from "inspector";

type Availability = {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  hourlyRate: number;
  bookingMode: string;
};

type Room = {
  id: string;
  name: string;
  areaSqm: number | null;
  maxPax: number;
  amenities: string[];
  photos: string[];
  availability: Availability[];
};

type BookedDate = {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Props = {
  studioId: string;
  studioSlug: string;
  studioName: string;
  userInitials: string;
  userEmail: string;
  rooms: Room[];
  bookedDates: BookedDate[];
};

const DOW_JS: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

function toDateKey(d: Date) {
  return d.toISOString().split("T")[0];
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function generateTimeOptions(openTime: string, closeTime: string): string[] {
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  const opts: string[] = [];
  for (let t = start; t < end; t += 60) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    opts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return opts;
}

function generateDurationOptions(
  startTime: string,
  closeTime: string,
): number[] {
  const [sh, sm] = startTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const maxHours = Math.floor((ch * 60 + cm - (sh * 60 + sm)) / 60);
  return Array.from({ length: maxHours }, (_, i) => i + 1);
}

export default function StudioRentalClient({
  studioId,
  studioSlug,
  studioName,
  userInitials,
  userEmail,
  rooms,
  bookedDates,
}: Props) {
  const router = useRouter();

  // Screen: "list" | "detail" | "confirmed"
  const [screen, setScreen] = useState<"list" | "detail" | "confirmed">("list");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Calendar
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Booking fields
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Confirmed booking state
  const [confirmedDetails, setConfirmedDetails] = useState<{
    roomName: string;
    date: string;
    startTime: string;
    endTime: string;
    total: number;
  } | null>(null);

  // Filters (list screen)
  const [sizeFilter, setSizeFilter] = useState("Any");
  const [priceFilter, setPriceFilter] = useState("Any");

  const minRate = (room: Room) =>
    room.availability.length > 0
      ? Math.min(...room.availability.map((a) => a.hourlyRate))
      : null;

  const availableDays = (room: Room) =>
    room.availability
      .map((a) => a.dayOfWeek.charAt(0) + a.dayOfWeek.slice(1, 3).toLowerCase())
      .join("·");

  const filteredRooms = rooms.filter((r) => {
    if (sizeFilter === "Small" && (r.areaSqm ?? 0) >= 50) return false;
    if (
      sizeFilter === "Medium" &&
      ((r.areaSqm ?? 0) < 50 || (r.areaSqm ?? 0) >= 100)
    )
      return false;
    if (sizeFilter === "Large" && (r.areaSqm ?? 0) < 100) return false;
    const rate = minRate(r);
    if (priceFilter === "Under $80" && (rate === null || rate >= 80))
      return false;
    if (priceFilter === "$80–150" && (rate === null || rate < 80 || rate > 150))
      return false;
    if (priceFilter === "$150+" && (rate === null || rate <= 150)) return false;
    return true;
  });

  // Calendar helpers
  const calDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const first = new Date(calYear, calMonth, 1);
    const startDow = (first.getDay() + 6) % 7; // Mon=0
    for (let i = 0; i < startDow; i++) days.push(null);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++)
      days.push(new Date(calYear, calMonth, d));
    return days;
  }, [calYear, calMonth]);

  const bookedDateKeys = useMemo(() => {
    if (!selectedRoom) return new Set<string>();
    return new Set(
      bookedDates
        .filter((b) => b.roomId === selectedRoom.id)
        .map((b) => toDateKey(new Date(b.date))),
    );
  }, [selectedRoom, bookedDates]);

  const isAvailableDay = (date: Date) => {
    if (!selectedRoom) return false;
    const dow = DOW_JS[date.getDay()];
    return selectedRoom.availability.some((a) => a.dayOfWeek === dow);
  };

  const availabilityForDate = (date: Date) => {
    if (!selectedRoom) return null;
    const dow = DOW_JS[date.getDay()];
    return selectedRoom.availability.find((a) => a.dayOfWeek === dow) ?? null;
  };

  const selectedAvail = selectedDate ? availabilityForDate(selectedDate) : null;
  const timeOptions = selectedAvail
    ? generateTimeOptions(selectedAvail.openTime, selectedAvail.closeTime)
    : [];
  const durationOptions =
    startTime && selectedAvail
      ? generateDurationOptions(startTime, selectedAvail.closeTime)
      : [];

  const endTime = startTime && duration ? addHours(startTime, duration) : "";
  const totalAmount = selectedAvail ? selectedAvail.hourlyRate * duration : 0;

  function openRoom(room: Room) {
    setSelectedRoom(room);
    setSelectedDate(null);
    setStartTime("");
    setDuration(1);
    setError(null);
    setCalYear(new Date().getFullYear());
    setCalMonth(new Date().getMonth());
    setScreen("detail");
  }

  function selectDate(date: Date) {
    const key = toDateKey(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;
    if (bookedDateKeys.has(key)) return;
    if (!isAvailableDay(date)) return;
    setSelectedDate(date);
    setStartTime("");
    setDuration(1);
    setError(null);
  }

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  }

  function nextMonth() {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    const next = new Date(calYear, calMonth + 1, 1);
    if (next > maxDate) return;
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  }

  async function handleBook() {
    if (!selectedRoom || !selectedDate || !startTime || !endTime) {
      setError("Please select a date and time.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { url } = await bookStudio({
        studioId,
        roomId: selectedRoom.id,
        date: selectedDate,
        startTime,
        endTime,
        totalAmount,
      });
      if (url) { window.location.href = url; return; }
      setConfirmedDetails({
        roomName: selectedRoom.name,
        date: selectedDate.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        startTime,
        endTime,
        total: totalAmount,
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // ── Detail screen ─────────────────────────────────────────────────────────────
  if (screen === "detail" && selectedRoom) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <StudioNav
          studioSlug={studioSlug}
          studioName={studioName}
          userInitials={userInitials}
        />

        <div className="grid grid-cols-[1fr_320px] gap-5 p-6 min-h-[calc(100vh-52px)] items-start">
          {/* Left: detail + calendar */}
          <div className="flex flex-col gap-4">
            <div>
              <button
                onClick={() => setScreen("list")}
                className="text-[12px] text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1"
              >
                ← Back to studios
              </button>
              <p className="text-[16px] font-medium text-gray-900 mb-0.5">
                {selectedRoom.name}
              </p>
              <p className="text-[13px] text-gray-500 mb-4">
                {selectedRoom.areaSqm && `${selectedRoom.areaSqm}m²`}
                {selectedRoom.areaSqm && " · "}
                Max {selectedRoom.maxPax} pax
                {selectedRoom.amenities.length > 0 &&
                  " · " + selectedRoom.amenities.join(", ")}
              </p>

              {/* Photo strip */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-[80px] bg-gray-100 border border-gray-100 rounded-lg flex items-center justify-center text-2xl text-gray-300"
                  >
                    ◻
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div>
              <p className="text-[13px] font-medium text-gray-800 mb-2">
                Availability — {MONTH_NAMES[calMonth]} {calYear}
              </p>
              <div className="flex gap-4 text-[11px] text-gray-500 mb-3">
                {[
                  {
                    color: "bg-[#E1F5EE] border border-[#1D9E75]",
                    label: "Selected",
                  },
                  { color: "bg-[#F1EFE8]", label: "Booked" },
                  {
                    color: "bg-white border border-gray-200",
                    label: "Available",
                  },
                  {
                    color: "bg-gray-50 border border-gray-100",
                    label: "Unavailable",
                  },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-sm inline-block ${color}`}
                    />
                    {label}
                  </span>
                ))}
              </div>

              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 text-[12px] font-medium flex justify-between items-center border-b border-gray-100">
                  <span>
                    {MONTH_NAMES[calMonth]} {calYear}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={prevMonth}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextMonth}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 text-center">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-[10px] text-gray-400 py-1.5 border-b border-gray-100"
                      >
                        {d}
                      </div>
                    ),
                  )}
                  {calDays.map((date, i) => {
                    if (!date)
                      return <div key={`e-${i}`} className="aspect-square" />;
                    const key = toDateKey(date);
                    const isPast = date < today;
                    const isBooked = bookedDateKeys.has(key);
                    const isAvail = isAvailableDay(date);
                    const isSelected = selectedDate
                      ? toDateKey(selectedDate) === key
                      : false;

                    let cls =
                      "aspect-square flex items-center justify-center text-[12px] border-b border-r border-gray-100 ";
                    if (isSelected)
                      cls +=
                        "bg-[#E1F5EE] text-[#085041] font-medium border-[#1D9E75]";
                    else if (isBooked)
                      cls +=
                        "bg-[#F1EFE8] text-gray-400 line-through cursor-not-allowed";
                    else if (isPast || !isAvail)
                      cls += "bg-gray-50 text-gray-300 cursor-not-allowed";
                    else cls += "text-gray-700 cursor-pointer hover:bg-gray-50";

                    return (
                      <div
                        key={key}
                        className={cls}
                        onClick={() =>
                          !isPast && !isBooked && isAvail && selectDate(date)
                        }
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-[12px] text-gray-400">
              {selectedRoom.areaSqm && `${selectedRoom.areaSqm}m² · `}Max
              occupancy: {selectedRoom.maxPax} pax · Browseable up to 6 months
              ahead
            </p>
          </div>

          {/* Right: booking panel */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-6">
            <p className="text-[14px] font-medium text-gray-900 mb-4">
              Book this space
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                  Date
                </label>
                <div className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-700">
                  {selectedDate ? (
                    selectedDate.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  ) : (
                    <span className="text-gray-400">
                      Select a date on the calendar
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                  Start time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setDuration(1);
                  }}
                  disabled={!selectedDate}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select start time</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {fmt12h(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={!startTime}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {durationOptions.map((h) => (
                    <option key={h} value={h}>
                      {h} hour{h !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {startTime && endTime && (
                <div className="bg-gray-50 rounded-lg p-3 text-[12px]">
                  <div className="flex justify-between py-1 text-gray-500">
                    <span>
                      {duration} hr{duration !== 1 ? "s" : ""} × $
                      {selectedAvail?.hourlyRate}/hr
                    </span>
                    <span>${totalAmount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-medium text-gray-900 border-t border-gray-200 mt-1 pt-2">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(0)}</span>
                  </div>
                </div>
              )}

              {error && <p className="text-[12px] text-red-500">{error}</p>}

              <button
                onClick={handleBook}
                disabled={loading || !selectedDate || !startTime}
                className="w-full py-2.5 text-[13px] font-medium bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition"
              >
                {loading
                  ? "Booking..."
                  : `Confirm booking${totalAmount ? ` · $${totalAmount.toFixed(0)}` : ""}`}
              </button>

              {selectedAvail?.bookingMode === "REQUEST" && (
                <div className="bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806]">
                  <strong className="font-medium">Request booking:</strong>{" "}
                  Studio owner will confirm within 24 hrs.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List screen ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav
        studioSlug={studioSlug}
        studioName={studioName}
        userInitials={userInitials}
      />

      <div className="flex min-h-[calc(100vh-52px)]">
        {/* Sidebar */}
        <aside className="w-[240px] flex-shrink-0 bg-white border-r border-gray-100 p-5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.5px] mb-4">
            Filters
          </p>

          <div className="mb-5">
            <p className="text-[12px] font-medium text-gray-600 mb-2">
              Room size
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Any", "Small (<50m²)", "Medium", "Large"].map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setSizeFilter(s === "Any" ? "Any" : s.split(" ")[0])
                  }
                  className={`text-[12px] px-2.5 py-1 rounded-full border transition ${sizeFilter === (s === "Any" ? "Any" : s.split(" ")[0]) ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[12px] font-medium text-gray-600 mb-2">
              Price range (per hr)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Any", "Under $80", "$80–150", "$150+"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`text-[12px] px-2.5 py-1 rounded-full border transition ${priceFilter === p ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Room list */}
        <main className="flex-1 p-6">
          <p className="text-[13px] text-gray-500 mb-4">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}{" "}
            available · bookable up to 6 months ahead
          </p>

          {filteredRooms.length === 0 ? (
            <p className="text-[13px] text-gray-400">
              No rooms match your filters.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredRooms.map((room) => {
                const rate = minRate(room);
                return (
                  <div
                    key={room.id}
                    onClick={() => openRoom(room)}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:border-gray-200 transition"
                  >
                    <div className="grid grid-cols-[140px_1fr]">
                      <div className="bg-gray-50 border-r border-gray-100 flex items-center justify-center text-3xl text-gray-300 min-h-[100px]">
                        ◻
                      </div>
                      <div className="p-4">
                        <p className="text-[14px] font-medium text-gray-900 mb-0.5">
                          {room.name}
                        </p>
                        <p className="text-[12px] text-gray-500 mb-2">
                          {studioName}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {room.areaSqm && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
                              {room.areaSqm}m²
                            </span>
                          )}
                          {room.amenities.map((a) => (
                            <span
                              key={a}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-500"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4 text-[12px] text-gray-500">
                          {rate !== null && (
                            <span>
                              From{" "}
                              <strong className="text-gray-800">
                                ${rate}/hr
                              </strong>
                            </span>
                          )}
                          <span>
                            Max{" "}
                            <strong className="text-gray-800">
                              {room.maxPax} pax
                            </strong>
                          </span>
                          {room.availability.length > 0 && (
                            <span>
                              Avail.{" "}
                              <strong className="text-gray-800">
                                {availableDays(room)}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
