type Props = {
  GENRES: string[];
  setGenre: (genre: string) => void;
  DAYS: string[];
  setDay: (day: string) => void;
  TIMES: string[];
  setTime: (time: string) => void;
  LEVELS: string[];
  setLevel: (level: string) => void;
  genre: string;
  day: string;
  time: string;
  level: string;
};

export default function ClassSideBar({
  GENRES,
  setGenre,
  DAYS,
  setDay,
  TIMES,
  setTime,
  LEVELS,
  setLevel,
  genre,
  day,
  time,
  level,
}: Props) {
  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-gray-100 p-5">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.5px] mb-4">
        Filters
      </p>

      <div className="mb-5">
        <p className="text-[12px] font-medium text-gray-600 mb-2">
          Dance style
        </p>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`text-[12px] px-2.5 py-1 rounded-full border transition ${genre === g ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[12px] font-medium text-gray-600 mb-2">Day</p>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`text-[12px] px-2.5 py-1 rounded-full border transition ${day === d ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[12px] font-medium text-gray-600 mb-2">
          Time of day
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={`text-[12px] px-2.5 py-1 rounded-full border transition ${time === t ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[12px] font-medium text-gray-600 mb-2">Level</p>
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`text-[12px] px-2.5 py-1 rounded-full border transition ${level === l ? "bg-[#E1F5EE] border-[#1D9E75] text-[#085041]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
