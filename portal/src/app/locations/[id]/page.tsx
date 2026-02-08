"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  LayoutDashboard,
  Box,
  Router,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  WifiOff,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SensorCard } from "@/components/SensorCard";
import { SensorDetailModal } from "@/components/SensorDetailModal";
import {
  getLocationDetails,
  type MonnitSensor,
  type TicketStatus,
  type TicketPriority,
} from "@/utils/mockData";

function formatRelativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatChartTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusIcon({ status }: { status: "Online" | "Offline" | "Warning" }) {
  switch (status) {
    case "Online":
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case "Warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "Offline":
      return <WifiOff className="h-5 w-5 text-slate-500" />;
    default:
      return null;
  }
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles = {
    Open: "bg-amber-500/20 text-amber-400",
    "In Progress": "bg-[#26ADE4]/20 text-[#26ADE4]",
    Resolved: "bg-emerald-500/20 text-emerald-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles = {
    Low: "text-slate-400",
    High: "text-amber-400",
    Critical: "text-red-400 font-semibold",
  };
  return <span className={styles[priority]}>{priority}</span>;
}

function SparklineChart({
  data,
  dataKey,
  color,
}: {
  data: { timestamp: string; temperature: number }[];
  dataKey: string;
  color?: string;
}) {
  const chartData = data.map((p) => ({
    ...p,
    time: formatChartTime(p.timestamp),
  }));
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color ?? "#26ADE4"} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color ?? "#26ADE4"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
          formatter={(value: number) => [`${value}°F`, ""]}
        />
        <Area
          type="monotone"
          dataKey="temperature"
          stroke={color ?? "#26ADE4"}
          fill={`url(#gradient-${dataKey})`}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type TabId = "overview" | "assets" | "network" | "tickets";

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = typeof params.id === "string" ? params.id : "";

  const details = useMemo(
    () => getLocationDetails(locationId),
    [locationId]
  );

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedSensor, setSelectedSensor] = useState<MonnitSensor | null>(null);

  const {
    building,
    sensors,
    assets,
    gateways,
    tickets,
    recentActivity,
    siteHealth,
    activeAlertsCount,
    openTicketsCount,
    onlineGatewaysCount,
    totalGatewaysCount,
  } = details;

  const assignedSensorIds = new Set(
    assets.flatMap((a) => a.assignedSensors)
  );
  const unassignedSensors = sensors.filter((s) => !assignedSensorIds.has(s.id));
  const tempSensors = sensors.filter((s) => s.type === "Temperature");

  const getSensorById = (id: string) =>
    sensors.find((s) => s.id === id) ?? null;

  if (!building) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Sidebar />
        <div className="pl-56">
          <TopBar />
          <main className="flex min-h-[60vh] items-center justify-center p-8">
            <div className="text-center">
              <p className="text-slate-400">Location not found.</p>
              <Link
                href="/locations"
                className="mt-4 inline-flex items-center gap-1 text-[#26ADE4] hover:underline"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Locations
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "assets", label: "Assets & Sensors", icon: Box },
    { id: "network", label: "Network", icon: Router },
    { id: "tickets", label: "Tickets", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          {/* Breadcrumb */}
          <Link
            href="/locations"
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-[#26ADE4]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Locations
          </Link>

          {/* Header & Identity */}
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{building.name}</h1>
              <p className="mt-1 text-slate-400">{building.address}</p>
              <p className="text-slate-500">
                {building.city}, {building.state}
              </p>
            </div>
            <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800 lg:h-24 lg:w-64">
              <Image
                src={building.image}
                alt={building.name}
                fill
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                <span className="text-sm text-slate-400">Map View</span>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Site Health
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {siteHealth}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Active Alerts
              </p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  activeAlertsCount > 0 ? "text-red-400" : "text-slate-300"
                }`}
              >
                {activeAlertsCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Open Tickets
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-100">
                {openTicketsCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Online Gateways
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-100">
                {onlineGatewaysCount}/{totalGatewaysCount} Online
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex gap-1 rounded-lg border border-slate-700/80 bg-slate-900/50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#26ADE4] text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="rounded-xl border border-slate-700/80 bg-slate-900">
                <div className="border-b border-slate-700/80 px-6 py-4">
                  <h3 className="font-semibold text-white">Recent Activity</h3>
                  <p className="text-sm text-slate-500">
                    Last 5 events at this site
                  </p>
                </div>
                <ul className="divide-y divide-slate-800">
                  {recentActivity.length === 0 ? (
                    <li className="px-6 py-8 text-center text-slate-500">
                      No recent activity
                    </li>
                  ) : (
                    recentActivity.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-800/30"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
                          {item.type === "alert" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          ) : (
                            <ClipboardList className="h-4 w-4 text-[#26ADE4]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {item.link ? (
                            <Link
                              href={item.link}
                              className="font-medium text-white hover:text-[#26ADE4]"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <p className="font-medium text-white">{item.title}</p>
                          )}
                          {item.meta && (
                            <p className="mt-0.5 text-sm text-slate-500">
                              {item.meta}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Temperature Aggregates */}
              {tempSensors.length > 0 && (
                <div className="rounded-xl border border-slate-700/80 bg-slate-900">
                  <div className="border-b border-slate-700/80 px-6 py-4">
                    <h3 className="font-semibold text-white">
                      Temperature (24h)
                    </h3>
                    <p className="text-sm text-slate-500">
                      Sparklines by sensor
                    </p>
                  </div>
                  <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tempSensors.map((sensor) => (
                      <div
                        key={sensor.id}
                        className="rounded-lg border border-slate-700/80 bg-slate-800/50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-200 line-clamp-1">
                            {sensor.name}
                          </p>
                          <span className="text-sm font-bold text-slate-100">
                            {sensor.lastReading}
                          </span>
                        </div>
                        <div className="mt-2 h-12">
                          <SparklineChart
                            data={sensor.history}
                            dataKey={sensor.id}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "assets" && (
            <div className="space-y-8">
              {/* Assets grouped by asset */}
              <div>
                <h3 className="mb-4 font-semibold text-white">
                  Grouped by Asset
                </h3>
                <div className="space-y-4">
                  {assets.map((asset) => {
                    const assetSensors = asset.assignedSensors
                      .map((id) => getSensorById(id))
                      .filter(Boolean) as MonnitSensor[];
                    return (
                      <div
                        key={asset.id}
                        className="rounded-xl border border-slate-700/80 bg-slate-900 p-5"
                      >
                        <h4 className="font-semibold text-white">
                          {asset.name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {asset.type} · {asset.status}
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {assetSensors.map((sensor) => (
                            <SensorCard
                              key={sensor.id}
                              sensor={sensor}
                              onClick={() => setSelectedSensor(sensor)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unassigned Sensors */}
              {unassignedSensors.length > 0 && (
                <div>
                  <h3 className="mb-4 font-semibold text-white">
                    Unassigned Sensors
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {unassignedSensors.map((sensor) => (
                      <SensorCard
                        key={sensor.id}
                        sensor={sensor}
                        onClick={() => setSelectedSensor(sensor)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {assets.length === 0 && unassignedSensors.length === 0 && (
                <p className="text-slate-500">No assets or sensors at this location.</p>
              )}
            </div>
          )}

          {activeTab === "network" && (
            <div className="rounded-xl border border-slate-700/80 bg-slate-900">
              <div className="border-b border-slate-700/80 px-6 py-4">
                <h3 className="font-semibold text-white">Gateways</h3>
                <p className="text-sm text-slate-500">
                  Network hubs at this location
                </p>
              </div>
              <div className="divide-y divide-slate-800">
                {gateways.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-500">
                    No gateways at this location
                  </div>
                ) : (
                  gateways.map((gateway) => (
                    <div
                      key={gateway.id}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-800/30"
                    >
                      <div className="flex items-center gap-4">
                        <StatusIcon status={gateway.status} />
                        <div>
                          <Link
                            href="/settings/gateways"
                            className="font-medium text-white hover:text-[#26ADE4]"
                          >
                            {gateway.name}
                          </Link>
                          <p className="text-sm text-slate-500">
                            {gateway.type} · {gateway.sensorCount} sensors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {gateway.signalStrength != null ? (
                          <span className="font-mono text-sm text-slate-400">
                            {gateway.signalStrength} dBm
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                        <span
                          className={`text-sm font-medium ${
                            gateway.status === "Online"
                              ? "text-emerald-400"
                              : gateway.status === "Warning"
                                ? "text-amber-400"
                                : "text-slate-500"
                          }`}
                        >
                          {gateway.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
              <div className="border-b border-slate-700/80 px-6 py-4">
                <h3 className="font-semibold text-white">Work Orders</h3>
                <p className="text-sm text-slate-500">
                  Tickets for this location
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/80">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Assigned
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No tickets for this location
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => router.push(`/maintenance/${ticket.id}`)}
                        className="cursor-pointer border-b border-slate-800/80 transition-colors hover:bg-slate-800/30 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-6 py-4 font-medium text-white">
                          {ticket.title}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {ticket.assignedTo}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(ticket.lastUpdated)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <SensorDetailModal
        sensor={selectedSensor}
        onClose={() => setSelectedSensor(null)}
      />
    </div>
  );
}
