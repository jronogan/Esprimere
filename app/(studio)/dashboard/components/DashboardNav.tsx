type Props = {
  studioName: string;
  ownerInitials: string;
};

export default function DashboardNav({ studioName, ownerInitials }: Props) {
  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-[52px] flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-medium tracking-tight">
          move<span className="text-[#1D9E75]">studio</span>
        </span>
        <span className="text-[12px] text-gray-400 ml-1">Studio portal</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-[#1D9E75] flex-shrink-0" />
          <strong className="font-medium text-gray-800">{studioName}</strong>
        </div>
        <div className="w-[30px] h-[30px] rounded-full bg-[#E1F5EE] flex items-center justify-center text-[12px] font-medium text-[#085041] flex-shrink-0">
          {ownerInitials}
        </div>
      </div>
    </nav>
  );
}
