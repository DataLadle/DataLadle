"use client";

import Link from "next/link";
import { Snowflake, Wind, Zap, Droplets } from "lucide-react";
import type { Asset, AssetType } from "@/utils/mockData";

const TYPE_ICONS: Record<AssetType, React.ElementType> = {
  Refrigeration: Snowflake,
  HVAC: Wind,
  Power: Zap,
  Plumbing: Droplets,
};

interface AssetCardProps {
  asset: Asset;
  locationName: string;
  locationId: string;
  sensorIds: string[];
  sensorNames: string[];
  sensorStatuses?: Record<string, "healthy" | "alert" | "offline">;
  onEdit?: () => void;
}

export function AssetCard({
  asset,
  locationName,
  locationId,
  sensorIds,
  sensorNames,
  sensorStatuses = {},
  onEdit,
}: AssetCardProps) {
  const TypeIcon = TYPE_ICONS[asset.type];

  const statusStyles = {
    Operational: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    "Maintenance Required": "bg-amber-500/20 text-amber-400 border-amber-500/40",
    "Out of Service": "bg-red-500/20 text-red-400 border-red-500/40",
  };

  return (
    <div
      className="rounded-xl border border-slate-700/80 bg-slate-800 p-5 transition-colors hover:border-slate-600"
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => e.key === "Enter" && onEdit?.()}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/80 text-[#26ADE4]">
          <TypeIcon className="h-5 w-5" />
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
            statusStyles[asset.status]
          }`}
        >
          {asset.status}
        </span>
      </div>

      <h3 className="mt-4 font-semibold text-white">{asset.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{asset.type}</p>
      <Link
        href={`/locations/${locationId}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-2 inline-block text-sm text-[#26ADE4] hover:underline"
      >
        {locationName}
      </Link>

      {sensorNames.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {sensorIds.map((id, i) => {
            const status = sensorStatuses[id] ?? "healthy";
            const statusColor =
              status === "healthy"
                ? "bg-emerald-500"
                : status === "alert"
                  ? "bg-amber-500"
                  : "bg-slate-500";
            return (
              <Link
                key={id}
                href={`/sensors/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/60 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600/60 hover:text-[#26ADE4]"
              >
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${statusColor}`}
                  title={status}
                />
                {sensorNames[i]}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
