import { PassPackageDTO } from "@/lib/types";

type Props = {
  pkg: PassPackageDTO;
  popular?: boolean;
};

export default function BuyPassCard({ pkg, popular = false }: Props) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 text-center cursor-pointer hover:border-[#1D9E75] transition ${
        popular ? "border-[#1D9E75]" : "border-gray-200"
      }`}
    >
      {popular && (
        <span className="inline-block text-[10px] font-medium bg-[#E1F5EE] text-[#085041] border border-[#9FE1CB] px-2 py-0.5 rounded-full mb-1.5">
          Most popular
        </span>
      )}
      <div className="text-[13px] font-medium text-gray-900 mb-0.5">{pkg.name}</div>
      <div className="text-[20px] font-medium text-[#1D9E75] my-1">${pkg.price}</div>
      <div className="text-[11px] text-gray-500">
        {pkg.type === "UNLIMITED"
          ? "Unlimited classes"
          : `${pkg.credits} ${pkg.credits === 1 ? "class" : "classes"}`}
        {pkg.expiryDays ? ` · ${pkg.expiryDays}d validity` : ""}
      </div>
      <button className="mt-3 w-full py-1.5 bg-[#1D9E75] text-white text-[12px] font-medium rounded-md hover:bg-[#0F6E56] transition">
        Buy
      </button>
    </div>
  );
}
