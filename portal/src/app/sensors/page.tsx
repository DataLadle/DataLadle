"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle, AlertTriangle, WifiOff, Battery } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RegisterSensorModal } from "@/components/RegisterSensorModal";
import { SensorSettingsSlideout } from "@/components/SensorSettingsSlideout";
import { MOCK_SENSORS, MOCK_BUILDINGS, type MonnitSensor } from "@/utils/mockData";

function getLocationName(buildingId: string) {
  return MOCK_BUILDINGS.find((b) => b.id === buildingId)?.name ?? "—";
}

function StatusIcon({ status }: { status: MonnitSensor["status"] }) {
  switch (status) {
    case "healthy":
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case "alert":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "offline":
      return <WifiOff className="h-5 w-5 text-slate-500" />;
    default:
      return null;
  }
}

function SignalBar({ dbm }: { dbm: number }) {
  const pct = Math.min(100, Math.max(0, ((dbm + 100) / 50) * 100));
  const color =
    dbm >= -60 ? "bg-emerald-500" : dbm >= -80 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs text-slate-400">{dbm} dBm</span>
    </div>
  );
}

function formatLastSeen(minutes: number) {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m ago` : `${h}h ago`;
}

export default function SensorsPage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<MonnitSensor | null>(null);

  const handleRegister = (sensorId: string, securityCode: string) => {
    console.log("Register sensor:", { sensorId, securityCode });
    setShowRegisterModal(false);
  };

  const handleSaveSettings = (
    id: string,
    data: { name: string; heartbeat: string; thresholdMin?: string; thresholdMax?: string }
  ) => {
    console.log("Save sensor settings:", id, data);
    setSelectedSensor(null);
  };

  const handleUnlink = (id: string) => {
    console.log("Unlink sensor:", id);
    setSelectedSensor(null);
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      Temperature: "Temp",
      Humidity: "Humidity",
      "Door/Window": "Door",
      "Water Leak": "Water",
    };
    return map[type] ?? type;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Sensors</h2>
              <p className="mt-1 text-slate-400">Monnit sensor inventory and configuration</p>
            </div>
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
            >
              <Plus className="h-4 w-4" />
              Register Sensor
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-700/80">
                    <th className="w-12 px-4 py-3 text-left">
                      <span className="sr-only">Status</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Sensor Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Reading
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Signal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Battery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Gateway
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Seen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SENSORS.map((sensor) => (
                    <tr
                      key={sensor.id}
                      onClick={() => setSelectedSensor(sensor)}
                      className="cursor-pointer border-b border-slate-800/80 transition-colors hover:bg-slate-800 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <StatusIcon status={sensor.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/sensors/${sensor.id}`}
                          className="font-medium text-white hover:text-[#26ADE4]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {sensor.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-slate-400">
                          {sensor.sensorId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/locations/${sensor.buildingId}`}
                          className="text-sm text-slate-300 hover:text-[#26ADE4]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getLocationName(sensor.buildingId)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">
                          {getTypeLabel(sensor.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">
                          {sensor.lastReading}
                          {sensor.unit && (
                            <span className="text-slate-500"> {sensor.unit}</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sensor.status === "offline" ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <SignalBar dbm={sensor.signalStrengthDbm} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-300">
                            {sensor.status === "offline"
                              ? "—"
                              : `${sensor.batteryVolts}V (${sensor.batteryPercent}%)`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-slate-400">
                          {sensor.gatewayId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500">
                          {formatLastSeen(sensor.lastSeenMinutes)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showRegisterModal && (
        <RegisterSensorModal
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegister}
        />
      )}

      {selectedSensor && (
        <SensorSettingsSlideout
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
          onSave={handleSaveSettings}
          onUnlink={handleUnlink}
        />
      )}
    </div>
  );
}
