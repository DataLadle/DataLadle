"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";

export function AdminTopBar() {
  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between border-b border-violet-900/80 bg-gradient-to-r from-violet-950 via-violet-950/98 to-slate-950/95 px-8 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-violet-400" />
          <span className="text-lg font-bold text-white">God Mode</span>
        </Link>
        <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
          Super Admin
        </span>
      </div>
      <Link
        href="/"
        className="rounded-lg border border-violet-600/60 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
      >
        Client View
      </Link>
    </header>
  );
}
