"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudioLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong.");
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
            href="/studio/register"
            className="text-[13px] px-4 py-1.5 bg-[#1D9E75] text-white rounded-md hover:bg-[#0F6E56] transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="px-8 py-12 flex justify-center">
        <div className="w-full max-w-[460px] bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-lg font-medium text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-gray-500 mb-6">
            Log in to your account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-medium text-gray-500 mb-1.5"
              >
                Email
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-md text-[13px] outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#E1F5EE]"
              />
              <div className="text-right mt-1">
                <a href="#" className="text-[12px] text-[#1D9E75]">
                  Forgot password?
                </a>
              </div>
            </div>

            {error && <p className="text-[13px] text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1D9E75] text-white rounded-md text-[14px] font-medium hover:bg-[#0F6E56] disabled:opacity-50 transition mt-1"
            >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-4">
            No account?{" "}
            <Link href="/studio/register" className="text-[#1D9E75]">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
