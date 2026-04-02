"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassPackage } from "@/actions/studio/updatePassPackage";
import type { PassPackageDTO } from "@/lib/types";

type Props = {
  studioId: string;
  pkg: PassPackageDTO | null;
  isOpen: boolean;
  onClose: () => void;
};

const inputCls =
  "w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE] placeholder:text-gray-400";
const labelCls = "block text-[12px] font-medium text-gray-500 mb-1.5";

export default function EditPackageModal({ studioId, pkg, isOpen, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"CREDITS" | "UNLIMITED">("CREDITS");
  const [credits, setCredits] = useState("");
  const [price, setPrice] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setType(pkg.type);
      setCredits(pkg.credits != null ? String(pkg.credits) : "");
      setPrice(String(pkg.price));
      setExpiryDays(pkg.expiryDays != null ? String(pkg.expiryDays) : "");
      setIsActive(pkg.isActive);
      setError(null);
    }
  }, [pkg]);

  if (!isOpen || !pkg) return null;

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updatePassPackage({
        packageId: pkg!.id,
        studioId,
        data: {
          name,
          type,
          credits: type === "CREDITS" && credits ? parseInt(credits) : null,
          price: parseFloat(price),
          expiryDays: expiryDays ? parseInt(expiryDays) : null,
          isActive,
        },
      });
      router.refresh();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[440px] p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-gray-900">Edit package</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>
              Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Type</label>
            <div className="flex gap-2">
              {(["CREDITS", "UNLIMITED"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 text-[12px] rounded-md border transition ${
                    type === t
                      ? "bg-[#1D9E75] text-white border-[#1D9E75]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t === "CREDITS" ? "Credits" : "Unlimited"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {type === "CREDITS" && (
              <div className="flex-1">
                <label className={labelCls}>
                  Credits <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
            <div className="flex-1">
              <label className={labelCls}>
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Expiry (days)</label>
              <input
                type="number"
                min="1"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                placeholder="No expiry"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-[12px] font-medium text-gray-700">Active</p>
              <p className="text-[11px] text-gray-400">Package is available for purchase</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isActive ? "bg-[#1D9E75]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? "translate-x-4" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-[13px] border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[13px] bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
