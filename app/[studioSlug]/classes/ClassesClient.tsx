"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StudioNav from "@/components/StudioNav";
import { fmt12h } from "@/lib/functions";
import { bookClass } from "@/actions/bookings/bookClass";
import type { ClassOccurrenceDTO, UserPassDTO, PassPackageDTO } from "@/lib/types";

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

const GENRES = ["All", "Hip-hop", "Ballet", "Jazz", "K-pop", "Contemporary", "Latin", "Ballroom"];
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
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const base = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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
    if (genre !== "All" && o.genre.toLowerCase() !== genre.toLowerCase()) return false;
    if (day !== "All" && shortDay(o.dayOfWeek) !== day) return false;
    if (time !== "All" && timeOfDay(o.startTime) !== time) return false;
    if (level !== "All" && o.level.toLowerCase() !== level.toLowerCase()) return false;
    return true;
  });

  const validPasses = userPasses.filter((p) => {
    if (p.expiresAt && new Date(p.expiresAt) < new Date()) return false;
    if (p.passPackage.type === "CREDITS" && (p.creditsRemaining ?? 0) < (selected?.creditCost ?? 1)) return false;
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
    if (!selectedPassId) { setError("Select a pass to continue."); return; }
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
        <StudioNav studioSlug={studioSlug} studioName={studioName} userInitials={userInitials} />
        <div className="p-8 flex justify-center">
          <div className="bg-white border border-gray-100 rounded-xl p-8 w-full max-w-[400px] text-center">
            <div className="w-11 h-11 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[16px] font-medium text-gray-900 mb-1">Booking confirmed!</p>
            <p className="text-[13px] text-gray-500 mb-6">A confirmation has been sent to {userEmail}</p>

            <div className="text-left mb-6">
              {[
                ["Class", confirmed.title],
                ["Date & time", `${dateLabel(confirmed.date)}, ${fmt12h(confirmed.startTime)}`],
                ["Room", confirmed.room.name],
                ["Instructor", confirmed.instructor?.name ?? "TBC"],
                ["Payment", `${confirmed.creditCost} credit (${confirmedPassName})`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[13px] py-2 border-b border-gray-100 last:border-0">
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
              <strong className="font-medium">Reminder:</strong> Cancel before 24 hrs for a full credit refund.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav studioSlug={studioSlug} studioName={studioName} userInitials={userInitials} />

      <div className="flex min-h-[calc(100vh-52px)]">
        {/* Sidebar filters */}
        <aside className="w-[220px] flex-shrink-0 bg-white border-r border-gray-100 p-5">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.5px] mb-4">Filters</p>

          <div className="mb-5">
            <p className="text-[12px] font-medium text-gray-600 mb-2">Dance style</p>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`text-[12px] px-2.5 py-1 rounded-full border transition ${genre === g ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[12px] font-medium text-gray-600 mb-2">Day</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => (
                <button key={d} onClick={() => setDay(d)}
                  className={`text-[12px] px-2.5 py-1 rounded-full border transition ${day === d ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[12px] font-medium text-gray-600 mb-2">Time of day</p>
            <div className="flex flex-wrap gap-1.5">
              {TIMES.map((t) => (
                <button key={t} onClick={() => setTime(t)}
                  className={`text-[12px] px-2.5 py-1 rounded-full border transition ${time === t ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[12px] font-medium text-gray-600 mb-2">Level</p>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`text-[12px] px-2.5 py-1 rounded-full border transition ${level === l ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-gray-500">
              {filtered.length} class{filtered.length !== 1 ? "es" : ""} available · up to 3 days ahead
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="text-[13px] text-gray-400">No classes match your filters.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {filtered.map((o) => {
                const full = o.bookingCount >= o.maxPax;
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
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] font-medium text-[#1D9E75] uppercase tracking-[0.4px] mb-1">{o.genre}</p>
                      <p className="text-[13px] font-medium text-gray-900 mb-1">{o.title}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {dateLabel(o.date)} · {fmt12h(o.startTime)}–{fmt12h(o.endTime)}<br />
                        {o.room.name}<br />
                        {o.instructor ? o.instructor.name : <span className="text-[#A32D2D]">No instructor</span>}
                      </p>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
                        <p className="text-[11px] text-gray-500">
                          <span className="font-medium text-gray-800">{o.bookingCount}</span> / {o.maxPax}
                        </p>
                        {o.alreadyBooked ? (
                          <span className="text-[12px] text-gray-400">Booked</span>
                        ) : full ? (
                          <span className="text-[12px] px-3 py-1 bg-gray-100 text-gray-400 rounded-md">Full</span>
                        ) : (
                          <button className="text-[12px] px-3 py-1 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition">
                            Book
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 bg-[#FAEEDA] border border-[#EF9F27] rounded-md px-3 py-2 text-[12px] text-[#633806]">
            <strong className="font-medium">Booking window:</strong> Only classes within the next 3 days are shown. Classes &lt;24hrs away lock cancellation automatically.
          </div>
        </main>
      </div>

      {/* Booking modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[420px] p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <p className="text-[16px] font-medium text-gray-900 mb-1">{selected.title}</p>
            <p className="text-[13px] text-gray-500 mb-5">
              {dateLabel(selected.date)} · {fmt12h(selected.startTime)}–{fmt12h(selected.endTime)} · {selected.room.name}
              {selected.instructor && ` · ${selected.instructor.name}`}
            </p>

            <p className="text-[12px] font-medium text-gray-500 mb-2">Select payment method</p>

            {/* Existing passes */}
            {validPasses.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {validPasses.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPassId(p.id); setBuyingPackageId(""); }}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center justify-between ${selectedPassId === p.id && !buyingPackageId ? "border-[#1D9E75] bg-[#E1F5EE]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div>
                      <p className={`text-[13px] font-medium ${selectedPassId === p.id && !buyingPackageId ? "text-[#085041]" : "text-gray-800"}`}>
                        {p.passPackage.name}
                        {p.passPackage.type === "CREDITS" && ` · ${p.creditsRemaining} credits remaining`}
                      </p>
                      {p.expiresAt && (
                        <p className={`text-[11px] ${selectedPassId === p.id && !buyingPackageId ? "text-[#0F6E56]" : "text-gray-400"}`}>
                          Expires {new Date(p.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <span className={`text-[13px] font-medium ${selectedPassId === p.id && !buyingPackageId ? "text-[#085041]" : "text-gray-600"}`}>
                      Use {selected.creditCost} credit{selected.creditCost !== 1 ? "s" : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Buy new pass */}
            {passPackages.length > 0 && (
              <>
                <div className="border-t border-gray-100 pt-3 mb-2">
                  <p className="text-[12px] font-medium text-gray-500 mb-2">Or buy a new pass</p>
                  <div className="flex flex-col gap-2">
                    {passPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => { setBuyingPackageId(pkg.id); setSelectedPassId(""); }}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center justify-between ${buyingPackageId === pkg.id ? "border-[#1D9E75] bg-[#E1F5EE]" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div>
                          <p className={`text-[13px] font-medium ${buyingPackageId === pkg.id ? "text-[#085041]" : "text-gray-800"}`}>{pkg.name}</p>
                          <p className={`text-[11px] ${buyingPackageId === pkg.id ? "text-[#0F6E56]" : "text-gray-400"}`}>
                            {pkg.expiryDays ? `Valid ${pkg.expiryDays} days` : "No expiry"}
                          </p>
                        </div>
                        <span className={`text-[13px] font-medium ${buyingPackageId === pkg.id ? "text-[#085041]" : "text-gray-600"}`}>
                          ${pkg.price.toFixed(0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-[12px] text-red-500 mb-2">{error}</p>}

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={closeModal} className="py-2.5 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={loading || (!selectedPassId && !buyingPackageId)}
                className="py-2.5 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition font-medium"
              >
                {loading ? "Booking..." : "Confirm booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
