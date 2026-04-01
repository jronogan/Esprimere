"use client";

import { menuSections } from "../config";
import type { DashboardTab } from "@/lib/types";

type Props = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
};

const icons: Record<DashboardTab, React.ReactNode> = {
  dashboard: (
    <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  ),
  rooms: (
    <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="12" height="12" rx="1" />
      <line x1="7" y1="1" x2="7" y2="13" />
      <line x1="1" y1="7" x2="7" y2="7" />
    </svg>
  ),
  instructors: (
    <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="7" cy="5" r="3" />
      <path d="M1 13c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  ),
  schedule: (
    <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2" width="12" height="11" rx="1" />
      <line x1="4" y1="1" x2="4" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="1" y1="6" x2="13" y2="6" />
    </svg>
  ),
  packages: (
    <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="4" width="12" height="9" rx="1" />
      <path d="M4 4V3a3 3 0 016 0v1" />
      <line x1="5" y1="7" x2="9" y2="7" />
    </svg>
  ),
  availability: (
    <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="7" cy="7" r="6" />
      <polyline points="7 4 7 7 9 9" />
    </svg>
  ),
  bookings: (
    <svg className="w-[14px] h-[14px] flex-shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1 3h12M1 7h8M1 11h5" />
    </svg>
  ),
};

export default function DashboardSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="w-[200px] bg-white border-r border-gray-100 p-4 flex-shrink-0">
      {menuSections.map((section) => (
        <div key={section.title}>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.5px] px-2 mb-1.5 mt-3 first:mt-0">
            {section.title}
          </p>
          {section.items.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md text-[13px] text-left mb-px transition-colors ${
                activeTab === item.key
                  ? "bg-[#E1F5EE] text-[#085041] font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className={activeTab === item.key ? "opacity-100" : "opacity-60"}>
                {icons[item.key]}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
