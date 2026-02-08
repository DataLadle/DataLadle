"use client";

import Link from "next/link";
import { ContractorSidebar } from "@/components/ContractorSidebar";
import { USER_IDS, getUserById } from "@/utils/mockData";

export default function ContractorSettingsPage() {
  const user = getUserById(USER_IDS.JOE_THE_TECH);

  return (
    <div className="min-h-screen bg-slate-950">
      <ContractorSidebar />
      <main className="pb-24 pl-0 pt-16 md:pl-24 md:pb-8 md:pt-8 lg:pl-56">
        <div className="px-4 md:px-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-slate-400">Account and preferences</p>

          <div className="mt-8 space-y-6">
            {user && (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
                <h2 className="font-semibold text-white">Profile</h2>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="text-slate-200">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="text-slate-200">{user.company}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Role</p>
                    <p className="text-slate-200 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <h2 className="font-semibold text-white">Account</h2>
              <Link
                href="/login"
                className="mt-4 inline-block text-[#26ADE4] hover:underline"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
