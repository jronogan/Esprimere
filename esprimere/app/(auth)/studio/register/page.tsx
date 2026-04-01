"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerStudio } from "@/actions/auth/registerStudio";

export default function StudioRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studioName, setStudioName] = useState("");
  const [slug, setSlug] = useState("");

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerStudio({
        firstName,
        lastName,
        email,
        password,
        studioName,
        slug,
      });
      router.push("/studio/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-8 h-[52px] flex items-center justify-between">
        <div className="text-[15px] font-medium tracking-tight">
          move<span className="text-[#1D9E75]">studio</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[13px] text-gray-500 cursor-pointer hover:text-gray-800">
            Classes
          </span>
          <span className="text-[13px] text-gray-500 cursor-pointer hover:text-gray-800">
            Studios
          </span>
          <Link
            href="/studio/login"
            className="text-[13px] px-4 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-700"
          >
            Log in
          </Link>
        </div>
      </nav>

      <div className="px-8 py-12 flex justify-center">
        <div className="w-full max-w-[460px] bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          {/* Step bar */}
          <div className="flex gap-2 mb-6">
            <div className="h-[3px] flex-1 rounded-full bg-[#1D9E75]" />
            <div className="h-[3px] flex-1 rounded-full bg-[#5DCAA5]" />
            <div className="h-[3px] flex-1 rounded-full bg-gray-200" />
          </div>

          <h1 className="text-lg font-medium text-gray-900 mb-1">
            Register your studio
          </h1>
          <p className="text-[13px] text-gray-500 mb-5">
            Set up your studio presence on the platform
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
            <div>
              <label
                htmlFor="studioName"
                className="block text-[12px] font-medium text-gray-500 mb-1.5"
              >
                Studio name
              </label>
              <input
                id="studioName"
                type="text"
                required
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-[12px] font-medium text-gray-500 mb-1.5"
              >
                Studio URL
              </label>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-[#1D9E75] focus-within:ring-2 focus-within:ring-[#E1F5EE]">
                <span className="px-2.5 py-2 text-[13px] text-gray-400 bg-gray-50 border-r border-gray-300 whitespace-nowrap">
                  esprimere.com/
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  placeholder="your-studio"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                  className="px-2.5 py-2 text-[13px] outline-none flex-1 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-[12px] font-medium text-gray-500 mb-1.5"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-[12px] font-medium text-gray-500 mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-medium text-gray-500 mb-1.5"
              >
                Contact email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-medium text-gray-500 mb-1.5"
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
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
              />
            </div>

            {error && <p className="text-[13px] text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1D9E75] text-white rounded-md text-[14px] font-medium hover:bg-[#0F6E56] disabled:opacity-50 transition mt-1"
            >
              {loading ? "Creating account..." : "Create studio account"}
            </button>
          </form>

          <div className="mt-4 px-3 py-2.5 bg-[#FAEEDA] border border-[#EF9F27] rounded-md text-[12px] text-[#633806]">
            <strong className="font-medium">Next:</strong> After registering,
            you&apos;ll set up rooms, class schedules, and pricing in your
            dashboard.
          </div>

          <p className="text-center text-[13px] text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/studio/login" className="text-[#1D9E75]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
