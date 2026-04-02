"use client";

import { PassPackageDTO } from "@/lib/types";

const thCls =
  "text-left text-[11px] font-medium text-gray-400 uppercase tracking-[0.3px] pb-2 border-b border-gray-100 pr-3";
const tdCls =
  "py-2.5 border-b border-gray-100 last:border-0 text-[13px] text-gray-800 align-top pr-3";

type Props = {
  title: string;
  packages: PassPackageDTO[];
  secondCol: { header: string; value: (p: PassPackageDTO) => string };
  showAddButton?: boolean;
  onAdd?: () => void;
  onEdit?: (p: PassPackageDTO) => void;
};

export default function PackageTable({
  title,
  packages,
  secondCol,
  showAddButton,
  onAdd,
  onEdit,
}: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-medium text-gray-800">{title}</p>
        {showAddButton && (
          <button
            onClick={onAdd}
            className="text-[12px] px-3 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
          >
            + Add package
          </button>
        )}
      </div>
      {packages.length === 0 ? (
        <p className="text-[13px] text-gray-400">No credit passes yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                "Package",
                secondCol.header,
                "Price",
                "Expiry",
                "Status",
                "",
              ].map((h) => (
                <th key={h} className={thCls}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id}>
                <td className={tdCls}>{p.name}</td>
                <td className={tdCls + " text-gray-500"}>
                  {secondCol.value(p)}
                </td>
                <td className={tdCls + " text-gray-500"}>
                  ${p.price.toFixed(0)}
                </td>
                <td className={tdCls + " text-gray-500"}>
                  {p.expiryDays ? `${p.expiryDays} days` : "No expiry"}
                </td>
                <td className={tdCls}>
                  {p.isActive ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full border bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]">
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full border bg-gray-100 text-gray-400 border-gray-200">
                      Inactive
                    </span>
                  )}
                </td>
                <td className={tdCls}>
                  <span
                    onClick={() => onEdit?.(p)}
                    className="text-[12px] text-[#1D9E75] cursor-pointer hover:underline"
                  >
                    Edit
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
