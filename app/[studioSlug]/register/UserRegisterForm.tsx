"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth/registerUser";
import { signIn } from "next-auth/react";
import StudioNav from "@/components/StudioNav";

export default function UserRegisterForm({
  studioId,
  studioSlug,
  studioName,
}: {
  studioId: string;
  studioSlug: string;
  studioName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth: new Date(dateOfBirth),
        studioId,
      });

      await signIn("credentials", {
        email,
        password,
        studioSlug,
        redirect: false,
      });

      router.push(`/${studioSlug}/profile`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const initial = studioName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <StudioNav studioSlug={studioSlug} studioName={studioName} />

      {/* Body */}
      <div className="px-4 py-10 flex justify-center">
        <div className="w-full max-w-[340px] bg-white border border-gray-200 rounded-xl px-6 py-7 shadow-sm">
          {/* Studio hero */}
          <div className="text-center mb-5">
            <div className="w-[52px] h-[52px] rounded-xl bg-[#1D9E75] flex items-center justify-center text-white text-[22px] font-medium mx-auto mb-2.5">
              {initial}
            </div>
            <div className="text-[15px] font-medium text-gray-900">
              {studioName}
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              Create your account to book classes
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-[11px] font-medium text-gray-500 mb-1"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-2.5 py-[7px] border border-gray-300 rounded-md text-[12px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-[11px] font-medium text-gray-500 mb-1"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-2.5 py-[7px] border border-gray-300 rounded-md text-[12px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-medium text-gray-500 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-[7px] border border-gray-300 rounded-md text-[12px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
              />
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-[11px] font-medium text-gray-500 mb-1"
              >
                Date of birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-2.5 py-[7px] border border-gray-300 rounded-md text-[12px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Used for birthday perks — never shared publicly
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-medium text-gray-500 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2.5 py-[7px] border border-gray-300 rounded-md text-[12px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
              />
            </div>

            {error && <p className="text-[12px] text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-[9px] bg-[#1D9E75] text-white rounded-md text-[13px] font-medium hover:bg-[#0F6E56] disabled:opacity-50 transition mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-3">
            powered by{" "}
            <span className="font-medium text-gray-500">esprimere</span>
          </p>

          <p className="text-center text-[13px] text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href={`/${studioSlug}/login`} className="text-[#1D9E75]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
