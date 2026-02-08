"use client";

import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useImpersonation } from "@/context/ImpersonationContext";
import {
  MOCK_RULE_DEFINITIONS,
  getSensorStatus,
  getSensorsForClient,
  getGatewaysByLocation,
  getLocationsByClient,
  getTicketsForClient,
  MOCK_ASSETS,
  MOCK_ALERTS,
  CLIENT_IDS,
} from "@/utils/mockData";

function useClientContext() {
  const { impersonatedClientId } = useImpersonation();
  return impersonatedClientId ?? CLIENT_IDS.ACME;
}

function getDashboardStats(clientId: string) {
  const sensors = getSensorsForClient(clientId);
  const locations = getLocationsByClient(clientId);
  const locIds = new Set(locations.map((l) => l.id));
  const gateways = locations.flatMap((l) => getGatewaysByLocation(l.id));
  const tickets = getTicketsForClient(clientId);
  const sensorIds = new Set(sensors.map((s) => s.id));
  const alerts = MOCK_ALERTS.filter((a) => sensorIds.has(a.sensorId));
  const assets = MOCK_ASSETS.filter((a) => locIds.has(a.locationId));

  const totalSensors = sensors.length;
  const totalGateways = gateways.length;
  const healthySensors = sensors.filter((s) => getSensorStatus(s) === "healthy").length;
  const onlineGateways = gateways.filter((g) => g.status === "Online").length;
  const systemHealthPercent =
    totalSensors + totalGateways > 0
      ? Math.round(
          ((healthySensors + onlineGateways) / (totalSensors + totalGateways)) * 100
        )
      : 100;

  const activeAlerts = alerts.filter((a) => a.status === "Active").length;
  const openTickets = tickets.filter((t) => t.status !== "Resolved").length;

  return {
    systemHealthPercent,
    activeAlerts,
    openTickets,
    totalAssets: assets.length,
  };
}

function getActionRequired(clientId: string) {
  const sensors = getSensorsForClient(clientId);
  const locations = getLocationsByClient(clientId);
  const gateways = locations.flatMap((l) => getGatewaysByLocation(l.id));
  const sensorsInAlert = sensors.filter((s) => getSensorStatus(s) === "alert");
  const gatewaysOffline = gateways.filter((g) => g.status === "Offline");
  return { sensorsInAlert, gatewaysOffline };
}

function getRecentActivity(clientId: string) {
  const tickets = getTicketsForClient(clientId);
  const sensors = getSensorsForClient(clientId);
  const sensorIds = new Set(sensors.map((s) => s.id));
  const alerts = MOCK_ALERTS.filter((a) => sensorIds.has(a.sensorId));

  const ticketEvents = tickets.map((t) => ({
    id: `ticket-${t.id}`,
    text: `Ticket ${t.id} ${t.status === "Resolved" ? "resolved" : "updated"}`,
    timestamp: new Date(t.lastUpdated).getTime(),
  }));

  const alertEvents = alerts.map((a) => {
    const sensor = sensors.find((s) => s.id === a.sensorId);
    const rule = MOCK_RULE_DEFINITIONS.find((r) => r.id === a.ruleId);
    return {
      id: `alert-${a.id}`,
      text:
        a.status === "Resolved"
          ? `${sensor?.name ?? "Sensor"} restored to normal`
          : `Alert: ${sensor?.name ?? "Device"} - ${a.value} (${rule?.name ?? "rule"})`,
      timestamp: new Date(a.timestamp).getTime(),
    };
  });

  const combined = [...ticketEvents, ...alertEvents]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  return combined;
}

function formatTimeAgo(ms: number) {
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function DashboardPage() {
  const clientId = useClientContext();
  const stats = getDashboardStats(clientId);
  const { sensorsInAlert, gatewaysOffline } = getActionRequired(clientId);
  const recentActivity = getRecentActivity(clientId);

  const hasActionRequired = sensorsInAlert.length > 0 || gatewaysOffline.length > 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="mt-1 text-slate-400">Executive summary</p>
          </div>

          {/* KPI Cards */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <p className="text-sm font-medium text-slate-400">System Health</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#26ADE4"
                      strokeWidth="2"
                      strokeDasharray={`${stats.systemHealthPercent}, 100`}
                      strokeLinecap="round"
                      className="transition-all"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#26ADE4]">
                    {stats.systemHealthPercent}%
                  </p>
                  <p className="text-sm text-slate-500">Operational</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <p className="text-sm font-medium text-slate-400">Active Alerts</p>
              <p className="mt-3 text-2xl font-bold text-red-400">
                {stats.activeAlerts} Critical
              </p>
            </div>

            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <p className="text-sm font-medium text-slate-400">Open Tickets</p>
              <p className="mt-3 text-2xl font-bold text-white">
                {stats.openTickets}
              </p>
              <p className="text-sm text-slate-500">Unresolved work orders</p>
            </div>

            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <p className="text-sm font-medium text-slate-400">Total Assets</p>
              <p className="mt-3 text-2xl font-bold text-white">
                {stats.totalAssets}
              </p>
              <p className="text-sm text-slate-500">Monitored equipment</p>
            </div>
          </div>

          {/* Middle Row */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Action Required */}
            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <h3 className="mb-4 font-semibold text-white">Action Required</h3>
              {hasActionRequired ? (
                <ul className="space-y-3">
                  {sensorsInAlert.map((sensor) => (
                    <li key={sensor.id}>
                      <Link
                        href="/alerts"
                        className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm hover:border-red-500/50"
                      >
                        <span className="font-medium text-red-400">
                          Sensor: {sensor.name}
                        </span>
                        <span className="text-xs text-slate-500">Alert</span>
                      </Link>
                    </li>
                  ))}
                  {gatewaysOffline.map((gw) => (
                    <li key={gw.id}>
                      <Link
                        href="/settings/gateways"
                        className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm hover:border-amber-500/50"
                      >
                        <span className="font-medium text-amber-400">
                          Gateway: {gw.name}
                        </span>
                        <span className="text-xs text-slate-500">Offline</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <span className="text-lg text-emerald-400">✓</span>
                  </div>
                  <p className="font-medium text-emerald-400">All Systems Nominal</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <h3 className="mb-4 font-semibold text-white">Recent Activity</h3>
              <ul className="space-y-3">
                {recentActivity.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-start justify-between border-b border-slate-800/80 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-slate-300">{event.text}</span>
                    <span className="text-xs text-slate-500">
                      {formatTimeAgo(Date.now() - event.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
            <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              {getLocationsByClient(clientId).map((building) => (
                <Link
                  key={building.id}
                  href={`/locations/${building.id}`}
                  className="rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-[#26ADE4]/50 hover:bg-[#26ADE4]/10 hover:text-[#26ADE4]"
                >
                  {building.name}
                </Link>
              ))}
              <Link
                href="/locations"
                className="rounded-lg border border-[#26ADE4]/40 bg-[#26ADE4]/10 px-4 py-2.5 text-sm font-medium text-[#26ADE4] transition-colors hover:bg-[#26ADE4]/20"
              >
                View All Locations →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
