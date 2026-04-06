import type { PassPackageDTO } from "@/lib/types";

type Props = {
  pkg: PassPackageDTO;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export default function NewPass({ pkg, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(pkg.id)}
      className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center justify-between ${isSelected ? "border-[#1D9E75] bg-[#E1F5EE]" : "border-gray-200 hover:border-gray-300"}`}
    >
      <div>
        <p className={`text-[13px] font-medium ${isSelected ? "text-[#085041]" : "text-gray-800"}`}>
          {pkg.name}
        </p>
        <p className={`text-[11px] ${isSelected ? "text-[#0F6E56]" : "text-gray-400"}`}>
          {pkg.expiryDays ? `Valid ${pkg.expiryDays} days` : "No expiry"}
        </p>
      </div>
      <span className={`text-[13px] font-medium ${isSelected ? "text-[#085041]" : "text-gray-600"}`}>
        ${pkg.price.toFixed(0)}
      </span>
    </button>
  );
}
