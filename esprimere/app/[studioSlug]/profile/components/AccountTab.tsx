"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/user/updateProfile";
import { updatePassword } from "@/actions/user/updatePassword";

type Props = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
  };
};

const inputClass =
  "w-full px-2.5 py-2 border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]";

const sectionLabel =
  "text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3";

export default function AccountTab({ user }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      await updateProfile({ firstName, lastName, email, dateOfBirth });
      setProfileMsg("Changes saved.");
      router.refresh();
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordLoading(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordMsg("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-[15px] font-medium text-gray-900 mb-4">Account settings</h2>

      <div className="max-w-[400px]">
        {/* Personal info */}
        <p className={sectionLabel}>Personal info</p>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Date of birth</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
          </div>
          {profileMsg && (
            <p className={`text-[12px] ${profileMsg === "Changes saved." ? "text-[#1D9E75]" : "text-red-500"}`}>
              {profileMsg}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2 bg-[#1D9E75] text-white text-[13px] font-medium rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition"
            >
              {profileLoading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        <hr className="border-gray-200 my-5" />

        {/* Security */}
        <p className={sectionLabel}>Security</p>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Current password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">New password</label>
            <input
              type="password"
              placeholder="••••••••"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {passwordMsg && (
            <p className={`text-[12px] ${passwordMsg === "Password updated." ? "text-[#1D9E75]" : "text-red-500"}`}>
              {passwordMsg}
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2 bg-[#1D9E75] text-white text-[13px] font-medium rounded-md hover:bg-[#0F6E56] disabled:opacity-50 transition"
            >
              {passwordLoading ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
