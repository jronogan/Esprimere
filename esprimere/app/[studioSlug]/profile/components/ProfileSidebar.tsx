import { Tab } from "@/lib/types";
import { userInitials } from "@/lib/functions";
import { menuItems } from "../config";

const icons: Record<Tab, React.ReactNode> = {
  passes: (
    <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="4" width="14" height="8" rx="2" />
      <line x1="5" y1="4" x2="5" y2="12" />
    </svg>
  ),
  bookings: (
    <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <line x1="5" y1="1" x2="5" y2="4" />
      <line x1="11" y1="1" x2="11" y2="4" />
      <line x1="2" y1="7" x2="14" y2="7" />
    </svg>
  ),
  studios: (
    <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="4" width="12" height="10" rx="1" />
      <path d="M5 4V3a3 3 0 016 0v1" />
    </svg>
  ),
  account: (
    <svg className="w-4 h-4 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  ),
};

type Props = {
  user: { firstName: string; lastName: string; email: string };
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export default function ProfileSidebar({ user, activeTab, onTabChange }: Props) {
  const initials = userInitials(user.firstName, user.lastName);

  return (
    <div className="w-[220px] flex-shrink-0 bg-white border-r border-gray-200 p-5">
      {/* Profile hero */}
      <div className="text-center pb-5 border-b border-gray-200 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#E1F5EE] border-2 border-[#9FE1CB] flex items-center justify-center text-[22px] font-medium text-[#085041] mx-auto mb-2">
          {initials}
        </div>
        <div className="text-[14px] font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-[12px] text-gray-500 mt-0.5">{user.email}</div>
        <span className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#085041] border border-[#9FE1CB]">
          Student
        </span>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-0.5">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[13px] text-left w-full transition ${
              activeTab === item.key
                ? "bg-[#E1F5EE] text-[#085041] font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            {icons[item.key]}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
