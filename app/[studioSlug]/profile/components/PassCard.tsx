import { UserPassDTO } from "@/lib/types";
import { formatDate } from "@/lib/functions";

type Props = {
  pass: UserPassDTO;
  expired?: boolean;
};

export default function PassCard({ pass, expired = false }: Props) {
  const { creditsRemaining, expiresAt, passPackage } = pass;

  const pct =
    passPackage.credits && creditsRemaining !== null
      ? Math.round((creditsRemaining / passPackage.credits) * 100)
      : null;

  if (expired) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 opacity-60">
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">
          {passPackage.name}
        </div>
        <div className="text-[24px] font-medium text-gray-900 leading-none">
          0{" "}
          <span className="text-[13px] font-normal text-gray-500">
            of {passPackage.credits ?? "∞"} left
          </span>
        </div>
        {expiresAt && (
          <div className="text-[11px] text-gray-500 mt-1">
            Expired {formatDate(expiresAt)}
          </div>
        )}
        <div className="h-1 bg-gray-100 rounded-full mt-2" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#1D9E75] rounded-xl p-4">
      <div className="text-[11px] font-medium text-[#1D9E75] uppercase tracking-wide mb-1">
        {passPackage.name}
      </div>
      {passPackage.type === "UNLIMITED" ? (
        <div className="text-[24px] font-medium text-gray-900 leading-none">
          ∞{" "}
          <span className="text-[13px] font-normal text-gray-500">unlimited</span>
        </div>
      ) : (
        <div className="text-[24px] font-medium text-gray-900 leading-none">
          {creditsRemaining}{" "}
          <span className="text-[13px] font-normal text-gray-500">
            of {passPackage.credits} left
          </span>
        </div>
      )}
      {expiresAt && (
        <div className="text-[11px] text-gray-500 mt-1">
          Expires {formatDate(expiresAt)}
        </div>
      )}
      {pct !== null && (
        <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-[#1D9E75] rounded-full" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
