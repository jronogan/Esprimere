"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateInstructorProfile } from "@/actions/studio/updateInstructor";
import type { InstructorDTO } from "@/lib/types";

type Props = {
  studioId: string;
  instructor: InstructorDTO | null;
  isOpen: boolean;
  onClose: () => void;
};

const inputCls =
  "w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-800 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE] placeholder:text-gray-400";
const labelCls = "block text-[12px] font-medium text-gray-500 mb-1.5";

export default function EditInstructorModal({ studioId, instructor, isOpen, onClose }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [styles, setStyles] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Populate fields when a different instructor is selected
  useEffect(() => {
    if (instructor) {
      setName(instructor.name);
      setBio(instructor.bio ?? "");
      setStyles(instructor.styles.join(", "));
      setPhotoUrl(instructor.photoUrl ?? "");
      setIsActive(instructor.isActive);
      setError(null);
    }
  }, [instructor]);

  if (!isOpen || !instructor) return null;

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateInstructorProfile({
        instructorId: instructor!.id,
        studioId,
        data: {
          name,
          bio: bio || undefined,
          styles: styles.split(",").map((s) => s.trim()).filter(Boolean),
          photoUrl: photoUrl || undefined,
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-[440px] p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-gray-900">Edit instructor</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Name <span className="text-red-400">*</span></label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Dance styles</label>
            <input
              value={styles}
              onChange={(e) => setStyles(e.target.value)}
              placeholder="e.g. Hip-hop, Contemporary, Ballet"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">Comma-separated</p>
          </div>

          <div>
            <label className={labelCls}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio about the instructor..."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          <div>
            <label className={labelCls}>Photo URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-[12px] font-medium text-gray-700">Active</p>
              <p className="text-[11px] text-gray-400">Instructor is currently teaching</p>
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
