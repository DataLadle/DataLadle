"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  List,
  LineChart as LineChartIcon,
  GitBranch,
  Settings,
  Battery,
  Signal,
  Heart,
  Trash2,
  CheckCircle,
  Plus,
  Thermometer,
  Droplets,
  Wifi,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import {
  getSensorDetails,
  getSensorDisplay,
  MOCK_GATEWAYS,
  MOCK_RULE_DEFINITIONS,
  type RuleDefinition,
} from "@/utils/mockData";

function formatRelativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} Minutes ago`;
  if (hours < 24) return `${hours} Hours ago`;
  return `${days} Days ago`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
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

function parseHeartbeatToMinutes(heartbeat: string): number {
  const m = heartbeat.match(/^(\d+)\s*min/i);
  if (m) return parseInt(m[1], 10);
  const h = heartbeat.match(/^(\d+)\s*h/i);
  if (h) return parseInt(h[1], 10) * 60;
  return 10;
}

function getNextCheckin(lastSeen: string, heartbeat: string): string {
  const mins = parseHeartbeatToMinutes(heartbeat);
  const next = new Date(new Date(lastSeen).getTime() + mins * 60 * 1000);
  return next.toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SignalBarsIcon({ dbm }: { dbm: number }) {
  const pct = Math.min(100, Math.max(0, ((dbm + 100) / 50) * 100));
  const bars = [20, 40, 60, 80].map((t) => pct >= t);
  return (
    <div className="flex items-end gap-0.5">
      {bars.map((filled, i) => (
        <div
          key={i}
          className={`h-2 w-1 rounded-sm ${
            filled ? "bg-[#26ADE4]" : "bg-slate-600"
          }`}
          style={{ height: `${(i + 1) * 4}px` }}
        />
      ))}
    </div>
  );
}

function BatteryIcon({ percent }: { percent: number }) {
  const isLow = percent < 20;
  const width = Math.max(8, Math.min(100, percent));
  return (
    <div className="relative h-5 w-8 rounded border border-slate-400 bg-slate-800">
      <div
        className={`absolute inset-y-0.5 left-0.5 rounded-sm ${
          isLow ? "bg-red-500" : "bg-emerald-500"
        }`}
        style={{ width: `${width}%` }}
      />
      <div className="absolute -right-1 top-1/2 h-2 w-0.5 -translate-y-1/2 rounded-r bg-slate-400" />
    </div>
  );
}

function RuleIcon({ rule }: { rule: RuleDefinition }) {
  const name = rule.name.toLowerCase();
  if (name.includes("battery")) return <Battery className="h-5 w-5 text-slate-400" />;
  if (name.includes("signal") || name.includes("weak")) return <Wifi className="h-5 w-5 text-slate-400" />;
  if (name.includes("temp") || name.includes("heat")) return <Thermometer className="h-5 w-5 text-slate-400" />;
  if (name.includes("humidity")) return <Droplets className="h-5 w-5 text-slate-400" />;
  return <Activity className="h-5 w-5 text-slate-400" />;
}

type TabId = "readings" | "charts" | "rules" | "settings";

export default function SensorDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { sensor, history, assignedRuleIds } = useMemo(
    () => getSensorDetails(id),
    [id]
  );

  const [activeTab, setActiveTab] = useState<TabId>("readings");
  const [assignedRules, setAssignedRules] = useState<Set<string>>(
    () => new Set(assignedRuleIds)
  );

  const gateway = sensor
    ? MOCK_GATEWAYS.find((g) => g.id === sensor.gatewayId)
    : null;
  const display = sensor ? getSensorDisplay(sensor) : null;

  const toggleRule = (ruleId: string) => {
    setAssignedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
    console.log("Toggle rule (mock):", ruleId);
  };

  if (!sensor) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Sidebar />
        <div className="pl-56">
          <TopBar />
          <main className="flex min-h-[60vh] items-center justify-center p-8">
            <p className="text-slate-400">Sensor not found</p>
          </main>
        </div>
      </div>
    );
  }

  const statusColor =
    sensor.status === "healthy" ? "bg-emerald-500" : "bg-red-500";
  const readings = history.slice(-10).reverse();
  const chartData = history.map((p) => ({
    ...p,
    time: formatChartTime(p.timestamp),
  }));

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "readings", label: "Readings", icon: List },
    { id: "charts", label: "Charts", icon: LineChartIcon },
    { id: "rules", label: "Rules", icon: GitBranch },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const displayValue = (p: { temperature: number }) => {
    if (sensor.type === "Humidity") return `${p.temperature}%`;
    if (sensor.type === "Temperature") return `${p.temperature}° F`;
    return String(p.temperature);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          {/* Sensor Identity Card */}
          <div
            className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800 shadow-lg`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1.5 ${statusColor}`}
            />
            <div className="flex flex-col gap-6 p-6 pl-8 sm:flex-row sm:items-center sm:justify-between">
              {/* Left */}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{sensor.name}</h1>
                <div className="mt-2 space-y-1 text-sm text-slate-400">
                  <p>
                    Gateway:{" "}
                    <Link
                      href="/settings/gateways"
                      className="font-medium text-[#26ADE4] hover:underline"
                    >
                      {gateway?.name ?? sensor.gatewayId}
                    </Link>
                  </p>
                  <p>
                    Network:{" "}
                    <Link
                      href="/settings/gateways"
                      className="font-medium text-[#26ADE4] hover:underline"
                    >
                      {gateway?.networkId ?? "—"}
                    </Link>
                  </p>
                </div>
              </div>

              {/* Center - Current Reading */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl font-bold text-white">
                  {display?.lastReading ?? sensor.displayData}
                </span>
                {sensor.type === "Temperature" && (
                  <Thermometer className="h-8 w-8 text-slate-500" />
                )}
                {sensor.type === "Humidity" && (
                  <Droplets className="h-8 w-8 text-slate-500" />
                )}
              </div>

              {/* Right - Signal, Battery, Last Message */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <SignalBarsIcon dbm={display?.signalStrengthDbm ?? -70} />
                    <span className="text-xs">Signal</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <BatteryIcon percent={display?.batteryPercent ?? sensor.battery} />
                    <span className="text-xs">{display?.batteryPercent ?? sensor.battery}%</span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-300">
                  Last Message: {formatRelativeTime(display?.lastSeenTimestamp ?? sensor.messageDate)}
                </div>
                <div className="text-sm text-slate-500">
                  Next Check-in: {getNextCheckin(display?.lastSeenTimestamp ?? sensor.messageDate, sensor.heartbeat ?? "10 min")}
                </div>
              </div>

              {/* Actions */}
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
                  aria-label="Favorite"
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex gap-1 rounded-lg border border-slate-700/80 bg-slate-900/50 p-1">
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
          <div className="mt-6">
            {activeTab === "readings" && (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-700/80 px-6 py-4">
                  <List className="h-5 w-5 text-slate-400" />
                  <h3 className="font-semibold text-white">Readings</h3>
                </div>
                <ul className="divide-y divide-slate-800">
                  {readings.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <span className="font-mono text-sm text-slate-300">
                        {displayValue(point)}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDateTime(point.timestamp)}
                      </span>
                      <SignalBarsIcon dbm={display?.signalStrengthDbm ?? -70} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "charts" && (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-700/80 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-slate-400" />
                    <h3 className="font-semibold text-white">Chart</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="font-medium text-[#26ADE4]">Data</span>
                    <span>|</span>
                    <span className="cursor-pointer hover:text-slate-200">Battery</span>
                  </div>
                </div>
                <div className="h-80 px-6 py-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                        formatter={(value: number) => [
                          `${value}${sensor.type === "Humidity" ? "%" : "°F"}`,
                          sensor.type,
                        ]}
                      />
                      {sensor.thresholdMin && (
                        <ReferenceLine
                          y={parseFloat(sensor.thresholdMin)}
                          stroke="#22c55e"
                          strokeDasharray="4 4"
                          label={{
                            value: `Min: ${sensor.thresholdMin}${sensor.unit}`,
                            fill: "#22c55e",
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#26ADE4"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "rules" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
                  <h3 className="mb-2 font-semibold text-white">
                    Add Sensor to Existing Rule
                  </h3>
                  <p className="mb-4 text-sm text-slate-400">
                    Click rule to enable/disable.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {MOCK_RULE_DEFINITIONS.map((rule) => {
                      const isAssigned = assignedRules.has(rule.id);
                      return (
                        <button
                          key={rule.id}
                          type="button"
                          onClick={() => toggleRule(rule.id)}
                          className="flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-800/50 px-4 py-4 text-left transition-colors hover:border-slate-600 hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <RuleIcon rule={rule} />
                            <div>
                              <p className="font-medium text-white">{rule.name}</p>
                              <p className="text-xs text-slate-500">
                                {rule.condition}
                              </p>
                            </div>
                          </div>
                          {isAssigned ? (
                            <CheckCircle className="h-6 w-6 shrink-0 text-emerald-500" />
                          ) : (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-500">
                              <Plus className="h-3 w-3 text-slate-500" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
                <h3 className="mb-4 font-semibold text-white">Sensor Settings</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-400">
                      Name
                    </label>
                    <p className="mt-1 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white">
                      {sensor.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400">
                      Heartbeat
                    </label>
                    <p className="mt-1 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white">
                      {sensor.heartbeat}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400">
                      Threshold Range
                    </label>
                    <p className="mt-1 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white">
                      {sensor.thresholdMin ?? "—"} – {sensor.thresholdMax ?? "—"}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    Edit settings via the main Sensors page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
