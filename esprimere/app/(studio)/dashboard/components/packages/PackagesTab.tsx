import type { PassPackageDTO } from "@/lib/types";

type Props = { passPackages: PassPackageDTO[] };

const thCls = "text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100 pr-3";
const tdCls = "py-2.5 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 align-top pr-3";

export default function PackagesTab({ passPackages }: Props) {
  const credits = passPackages.filter((p) => p.type === "CREDITS");
  const unlimited = passPackages.filter((p) => p.type === "UNLIMITED");

  return (
    <div>
      <h1 className="text-[16px] font-medium text-gray-900">Class packages</h1>
      <p className="text-[13px] text-gray-500 mt-0.5 mb-5">Configure pass types and pricing</p>

      <div className="bg-white border border-gray-100 rounded-lg p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-medium text-gray-800">Credit passes</p>
          <button className="text-[12px] px-3 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition">
            + Add package
          </button>
        </div>
        {credits.length === 0 ? (
          <p className="text-[13px] text-gray-400">No credit passes yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Package", "Credits", "Price", "Expiry", "Status", ""].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {credits.map((p) => (
                <tr key={p.id}>
                  <td className={tdCls}>{p.name}</td>
                  <td className={tdCls + " text-gray-500"}>{p.credits ?? "—"}</td>
                  <td className={tdCls + " text-gray-500"}>${p.price.toFixed(0)}</td>
                  <td className={tdCls + " text-gray-500"}>
                    {p.expiryDays ? `${p.expiryDays} days` : "No expiry"}
                  </td>
                  <td className={tdCls}>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]">
                      Active
                    </span>
                  </td>
                  <td className={tdCls}>
                    <span className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline">Edit</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {unlimited.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <p className="text-[13px] font-medium text-gray-800 mb-4">Unlimited passes</p>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Package", "Type", "Price", "Expiry", "Status", ""].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unlimited.map((p) => (
                <tr key={p.id}>
                  <td className={tdCls}>{p.name}</td>
                  <td className={tdCls + " text-gray-500"}>Unlimited</td>
                  <td className={tdCls + " text-gray-500"}>${p.price.toFixed(0)}</td>
                  <td className={tdCls + " text-gray-500"}>
                    {p.expiryDays ? `${p.expiryDays} days` : "No expiry"}
                  </td>
                  <td className={tdCls}>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]">
                      Active
                    </span>
                  </td>
                  <td className={tdCls}>
                    <span className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline">Edit</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
