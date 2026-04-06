import Link from "next/link";
import { studioInitials } from "@/lib/functions";
import { logout } from "@/actions/auth/logout";

type Props = {
  studioSlug: string;
  studioName: string;
  userInitials?: string; // if provided, shows Classes/Spaces links + avatar
};

export default function StudioNav({
  studioSlug,
  studioName,
  userInitials,
}: Props) {
  return (
    <nav className="bg-white border-b border-gray-200 px-5 h-[52px] flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[6px] bg-[#1D9E75] flex items-center justify-center text-white text-[13px] font-medium flex-shrink-0">
          {studioInitials(studioName)}
        </div>
        <div>
          <div className="text-[14px] font-medium text-gray-900 leading-none">
            {studioName}
          </div>
          <div className="text-[10px] text-gray-400 leading-none mt-0.5">
            powered by esprimere
          </div>
        </div>
      </div>

      {userInitials && (
        <div className="flex items-center gap-4">
          <Link
            href={`/${studioSlug}/classes`}
            className="text-[13px] text-gray-500 hover:text-gray-800"
          >
            Classes
          </Link>
          <Link
            href={`/${studioSlug}/spaces`}
            className="text-[13px] text-gray-500 hover:text-gray-800"
          >
            Spaces
          </Link>
          <form action={logout.bind(null, studioSlug)}>
            <button
              type="submit"
              className="text-[13px] text-gray-500 hover:text-gray-800"
            >
              Logout
            </button>
          </form>
          <Link href={`/${studioSlug}/profile`}>
            <div className="w-[30px] h-[30px] rounded-full bg-[#E1F5EE] flex items-center justify-center text-[12px] font-medium text-[#085041] border border-[#9FE1CB]">
              {userInitials}
            </div>
          </Link>
        </div>
      )}
    </nav>
  );
}
