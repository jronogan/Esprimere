import { UserPassDTO, PassPackageDTO } from "@/lib/types";
import PassCard from "./PassCard";
import BuyPassCard from "./BuyPassCard";

type Props = {
  userPasses: UserPassDTO[];
  passPackages: PassPackageDTO[];
};

export default function PassesTab({ userPasses, passPackages }: Props) {
  const activePasses = userPasses.filter(
    (p) =>
      (p.creditsRemaining === null || p.creditsRemaining > 0) &&
      (!p.expiresAt || new Date(p.expiresAt) > new Date()),
  );
  const expiredPasses = userPasses.filter(
    (p) =>
      (p.creditsRemaining !== null && p.creditsRemaining === 0) ||
      (p.expiresAt && new Date(p.expiresAt) <= new Date()),
  );

  return (
    <div>
      <h2 className="text-[15px] font-medium text-gray-900 mb-4">My passes</h2>

      {userPasses.length === 0 && (
        <p className="text-[13px] text-gray-400 mb-6">
          You don&apos;t have any passes yet.
        </p>
      )}

      {activePasses.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5 mb-6">
          {activePasses.map((p) => <PassCard key={p.id} pass={p} />)}
        </div>
      )}

      {expiredPasses.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5 mb-6">
          {expiredPasses.map((p) => <PassCard key={p.id} pass={p} expired />)}
        </div>
      )}

      <hr className="border-gray-200 my-5" />

      <h3 className="text-[15px] font-medium text-gray-900 mb-3">Buy a new pass</h3>
      <div className="grid grid-cols-3 gap-2">
        {passPackages.map((p, i) => (
          <BuyPassCard key={p.id} pkg={p} popular={i === 1} />
        ))}
      </div>
    </div>
  );
}
