"use client";

import Image from "next/image";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useImpersonation } from "@/context/ImpersonationContext";
import { getClientById } from "@/utils/mockData";

export function TopBar() {
  const { impersonatedClientId, exitImpersonation } = useImpersonation();
  const client = impersonatedClientId
    ? getClientById(impersonatedClientId)
    : null;

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm">
      {impersonatedClientId && client && (
        <div className="flex items-center justify-between bg-violet-950/80 px-8 py-2">
          <span className="text-sm text-violet-300">
            Viewing as <strong>{client.name}</strong>
          </span>
          <Link
            href="/admin/dashboard"
            onClick={exitImpersonation}
            className="flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            <LogOut className="h-4 w-4" />
            Exit impersonation
          </Link>
        </div>
      )}
      <div className="flex h-16 items-center justify-between px-8">
        <Image
          src="/Logo transparent.png"
          alt="Data Ladle"
          width={150}
          height={45}
          className="h-auto w-[150px] object-contain"
        />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300">
            <User className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-slate-300">User</span>
        </div>
      </div>
    </header>
  );
}
