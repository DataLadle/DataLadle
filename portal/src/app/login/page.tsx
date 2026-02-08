"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { USER_IDS } from "@/utils/mockData";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUserById } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    const lower = email.toLowerCase();
    if (lower.includes("admin")) {
      setCurrentUserById(USER_IDS.SUPER_ADMIN);
      router.push("/admin/dashboard");
      return;
    }
    if (lower.includes("premium")) {
      setCurrentUserById(USER_IDS.PREMIUM_CLIENT);
      router.push("/");
      return;
    }
    if (lower.includes("client")) {
      setCurrentUserById(USER_IDS.FACILITY_MANAGER);
      router.push("/");
      return;
    }
    if (lower.includes("tech")) {
      setCurrentUserById(USER_IDS.JOE_THE_TECH);
      router.push("/contractor");
      return;
    }

    setError("Unknown user. Try 'client@acme.com', 'premium@acme.com', 'tech@dataladle.com', or 'admin@dataladle.com'");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex">
        <div>
          <span className="text-2xl font-bold text-white">Data Ladle</span>
          <p className="mt-2 text-slate-400">IoT Monitoring Platform</p>
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-gradient-to-br from-[#26ADE4]/20 to-slate-800" />
          <p className="text-sm text-slate-500">
            Environmental sensors, asset monitoring, and maintenance workflows.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col justify-center bg-slate-950 px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <span className="text-xl font-bold text-white">Data Ladle</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-2 text-slate-400">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#26ADE4] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
            >
              Sign in
            </button>
          </form>

          <p className="mt-8 text-xs text-slate-500">
            Demo: &quot;client&quot; → basic, &quot;premium&quot; → premium,
            &quot;tech&quot; → contractor, &quot;admin&quot; → God Mode
          </p>
        </div>
      </div>
    </div>
  );
}
