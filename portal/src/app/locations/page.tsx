"use client";

import { useState } from "react";
import Link from "next/link";
import { List, LayoutGrid, CheckCircle, AlertCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { BuildingCard } from "@/components/BuildingCard";
import { useImpersonation } from "@/context/ImpersonationContext";
import { getLocationsByClient, getSensorsByLocation, getGatewaysByLocation, getSensorStatus, CLIENT_IDS } from "@/utils/mockData";

function useClientContext() {
  const { impersonatedClientId } = useImpersonation();
  return impersonatedClientId ?? CLIENT_IDS.ACME;
}

function getNetworkHealth(locationId: string): "good" | "warning" | "critical" {
  const gateways = getGatewaysByLocation(locationId);
  if (gateways.length === 0) return "good";
  const hasOffline = gateways.some((g) => g.status === "Offline");
  const hasWarning = gateways.some((g) => g.status === "Warning");
  if (hasOffline) return "critical";
  if (hasWarning) return "warning";
  return "good";
}

function getLocationStats(locations: ReturnType<typeof getLocationsByClient>) {
  const stats = new Map<string, { count: number; hasCritical: boolean }>();
  for (const loc of locations) {
    const sensors = getSensorsByLocation(loc.id);
    const hasCritical = sensors.some(
      (s) => getSensorStatus(s) === "alert" || getSensorStatus(s) === "offline"
    );
    stats.set(loc.id, { count: sensors.length, hasCritical });
  }
  return stats;
}

export default function LocationsPage() {
  const clientId = useClientContext();
  const locations = getLocationsByClient(clientId);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const stats = getLocationStats(locations);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Locations</h2>
              <p className="mt-1 text-slate-400">Client sites and buildings</p>
            </div>
            <div className="flex rounded-lg border border-slate-700/80 bg-slate-800/50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === "table"
                    ? "bg-[#26ADE4]/20 text-[#26ADE4]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === "cards"
                    ? "bg-[#26ADE4]/20 text-[#26ADE4]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                aria-label="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {viewMode === "table" ? (
            <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      City / State
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Sensors
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Alerts
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Network
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Health
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((building) => {
                    const locStats = stats.get(building.id);
                    const totalSensors = locStats?.count ?? 0;
                    const isHealthy = !(locStats?.hasCritical ?? false);

                    return (
                      <tr
                        key={building.id}
                        className="border-b border-slate-800/80 transition-colors hover:bg-slate-800/30 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/locations/${building.id}`}
                            className="font-medium text-white hover:text-[#26ADE4]"
                          >
                            {building.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {building.address}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {building.city}, {building.state}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {totalSensors}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {building.stats.alerts}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex h-3 w-3 shrink-0 rounded-full ${
                              getNetworkHealth(building.id) === "good"
                                ? "bg-emerald-500"
                                : getNetworkHealth(building.id) === "warning"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                            title={
                              getNetworkHealth(building.id) === "good"
                                ? "All gateways online"
                                : getNetworkHealth(building.id) === "warning"
                                  ? "Gateway warning"
                                  : "Gateway offline"
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`flex items-center gap-1.5 text-xs font-medium ${
                              isHealthy ? "text-[#26ADE4]" : "text-red-400"
                            }`}
                          >
                            {isHealthy ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Healthy
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4" />
                                Critical
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((building) => {
                const locStats = stats.get(building.id);
                const totalSensors = locStats?.count ?? 0;

                return (
                  <BuildingCard
                    key={building.id}
                    building={{
                      ...building,
                      stats: {
                        ...building.stats,
                        totalSensors,
                      },
                    }}
                    networkHealth={getNetworkHealth(building.id)}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
