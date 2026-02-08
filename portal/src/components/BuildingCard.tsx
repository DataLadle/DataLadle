"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Building } from "@/utils/mockData";

interface BuildingCardProps {
  building: Building;
  networkHealth?: "good" | "warning" | "critical";
}

export function BuildingCard({ building, networkHealth = "good" }: BuildingCardProps) {
  const hasAlerts = building.stats.alerts > 0;

  return (
    <Link
      href={`/locations/${building.id}`}
      className={`group block w-full overflow-hidden rounded-xl border bg-slate-900 text-left transition-all hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-[#26ADE4]/50 ${
        hasAlerts
          ? "border-red-500/50 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
          : "border-[#26ADE4]/40 shadow-[0_0_0_1px_rgba(38,173,228,0.15)]"
      }`}
    >
      {/* Top: Building Name & City */}
      <div className="border-b border-slate-800/80 p-4">
        <h3 className="text-lg font-semibold text-white">{building.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
          <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
          {building.city}, {building.state}
        </p>
      </div>

      {/* Middle: Placeholder image or map icon */}
      <div className="relative flex h-32 items-center justify-center bg-slate-800/50">
        <Image
          src={building.image}
          alt={building.name}
          width={400}
          height={160}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
          <MapPin className="h-10 w-10 text-slate-600" />
        </div>
      </div>

      {/* Bottom: Stats row */}
      <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
              networkHealth === "good" ? "bg-emerald-500" : networkHealth === "warning" ? "bg-amber-500" : "bg-red-500"
            }`}
            title={networkHealth === "good" ? "Network OK" : networkHealth === "warning" ? "Network warning" : "Network offline"}
          />
          <span className="text-sm text-slate-400">
            <span className="font-semibold text-slate-200">{building.stats.totalSensors}</span>
            {" Sensors"}
          </span>
        </div>
        <span
          className={`text-sm font-medium ${
            building.stats.alerts > 0 ? "text-red-400" : "text-[#26ADE4]"
          }`}
        >
          <span className="font-bold">{building.stats.alerts}</span>
          {" Alert"}
          {building.stats.alerts !== 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
}
