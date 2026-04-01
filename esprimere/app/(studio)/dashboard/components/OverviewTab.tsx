import type { DashboardStatsDTO, TodayClassDTO, UpcomingRentalDTO } from "@/lib/types";
import { formatDate } from "@/lib/functions";

type Props = {
  studioName: string;
  stats: DashboardStatsDTO;
  todayClasses: TodayClassDTO[];
  upcomingRentals: UpcomingRentalDTO[];
};

function fmt12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function classStatus(c: TodayClassDTO) {
  if (!c.instructor) return { label: "No instructor", cls: "bg-[#FCEBEB] text-[#A32D2D] border-[#F09595]" };
  if (c.bookingCount >= c.maxPax) return { label: "Full", cls: "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]" };
  return { label: "On", cls: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]" };
}

function rentalStatusCls(status: string) {
  if (status === "CONFIRMED") return "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]";
  if (status === "PENDING") return "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]";
  return "bg-gray-100 text-gray-500 border-gray-200";
}

const thCls = "text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100";
const tdCls = "py-2.5 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 align-top";

export default function OverviewTab({ studioName, stats, todayClasses, upcomingRentals }: Props) {
  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Dashboard</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">Overview for {studioName}</p>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {[
          { label: "Bookings this week", val: stats.classesThisWeek, sub: "class bookings" },
          { label: "Bookings today", val: stats.bookingsToday, sub: "confirmed + pending" },
          { label: "Studio rentals", val: stats.rentalsThisMonth, sub: "this month" },
          {
            label: "Revenue (this month)",
            val: `$${Math.round(stats.revenueThisMonth).toLocaleString()}`,
            sub: "passes + rentals",
          },
        ].map(({ label, val, sub }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-lg p-3">
            <p className="text-[11px] text-gray-500 mb-1">{label}</p>
            <p className="text-[22px] font-medium text-gray-900 leading-none">{val}</p>
            <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Today's classes */}
      <div className="bg-white border border-gray-100 rounded-lg p-5 mb-4">
        <p className="text-[13px] font-medium text-gray-800 mb-4">Today's classes</p>
        {todayClasses.length === 0 ? (
          <p className="text-[13px] text-gray-400">No classes scheduled today.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Class", "Time", "Room", "Instructor", "Bookings", "Status", ""].map((h) => (
                  <th key={h} className={thCls + " pr-3"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayClasses.map((c) => {
                const st = classStatus(c);
                return (
                  <tr key={c.id}>
                    <td className={tdCls + " pr-3"}>{c.title}</td>
                    <td className={tdCls + " pr-3 text-gray-500"}>{fmt12h(c.startTime)}</td>
                    <td className={tdCls + " pr-3 text-gray-500"}>{c.room.name}</td>
                    <td className={`${tdCls} pr-3 ${c.instructor ? "text-gray-500" : "text-[#A32D2D]"}`}>
                      {c.instructor?.name ?? "Unassigned"}
                    </td>
                    <td className={tdCls + " pr-3 text-gray-500"}>{c.bookingCount} / {c.maxPax}</td>
                    <td className={tdCls + " pr-3"}>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className={tdCls}>
                      <span className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline">Manage</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Upcoming rentals */}
      <div className="bg-white border border-gray-100 rounded-lg p-5">
        <p className="text-[13px] font-medium text-gray-800 mb-4">Upcoming rentals</p>
        {upcomingRentals.length === 0 ? (
          <p className="text-[13px] text-gray-400">No upcoming rentals.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Renter", "Room", "Date & time", "Paid", "Status"].map((h) => (
                  <th key={h} className={thCls + " pr-3"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcomingRentals.map((r) => (
                <tr key={r.id}>
                  <td className={tdCls + " pr-3"}>{r.renterName}</td>
                  <td className={tdCls + " pr-3 text-gray-500"}>{r.room.name}</td>
                  <td className={tdCls + " pr-3 text-gray-500"}>
                    {formatDate(r.date)} · {fmt12h(r.startTime)}–{fmt12h(r.endTime)}
                  </td>
                  <td className={tdCls + " pr-3 text-gray-500"}>${Math.round(r.totalAmount)}</td>
                  <td className={tdCls}>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${rentalStatusCls(r.status)}`}>
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
