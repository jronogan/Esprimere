import type { UserPassDTO } from "@/lib/types";

type Props = {
  pass: UserPassDTO;
  creditCost: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export default function ValidPass({ pass, creditCost, isSelected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(pass.id)}
      className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center justify-between ${isSelected ? "border-[#1D9E75] bg-[#E1F5EE]" : "border-gray-200 hover:border-gray-300"}`}
    >
      <div>
        <p className={`text-[13px] font-medium ${isSelected ? "text-[#085041]" : "text-gray-800"}`}>
          {pass.passPackage.name}
          {pass.passPackage.type === "CREDITS" && ` · ${pass.creditsRemaining} credits remaining`}
        </p>
        {pass.expiresAt && (
          <p className={`text-[11px] ${isSelected ? "text-[#0F6E56]" : "text-gray-400"}`}>
            Expires{" "}
            {new Date(pass.expiresAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>
      <span className={`text-[13px] font-medium ${isSelected ? "text-[#085041]" : "text-gray-600"}`}>
        Use {creditCost} credit{creditCost !== 1 ? "s" : ""}
      </span>
    </button>
  );
}
