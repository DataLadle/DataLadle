"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <h2 className="text-2xl font-bold text-white">Users</h2>
          <p className="mt-1 text-slate-400">User and access management</p>
          <div className="mt-8 rounded-xl border border-slate-700/80 bg-slate-900 p-8 text-center">
            <p className="text-slate-500">User management coming soon.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
