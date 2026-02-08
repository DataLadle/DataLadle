"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle, AlertTriangle, WifiOff, Battery } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RegisterSensorModal } from "@/components/RegisterSensorModal";
import { SensorSettingsSlideout } from "@/components/SensorSettingsSlideout";
import {
  MOCK_SENSORS,
  getSensorDisplay,
  getSensorStatus,
  getSensorLocationId,
  getLocationById,
  type MonnitSensor,
} from "@/utils/mockData";

function StatusIcon({ status }: { status: "healthy" | "alert" | "offline" }) {
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
  const color = dbm >= -60 ? "bg-emerald-500" : dbm >= -80 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
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

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    Temperature: "Temp",
    Humidity: "Humidity",
    "Door/Window": "Door",
    "Water Leak": "Water",
  };
  return map[type] ?? type;
}

export default function DevicesPage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<MonnitSensor | null>(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Devices</h2>
              <p className="mt-1 text-slate-400">Sensors and device configuration</p>
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
                    <th className="w-12 px-4 py-3 text-left"><span className="sr-only">Status</span></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Sensor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Last Reading</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Signal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Battery</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Gateway</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SENSORS.map((sensor) => {
                    const display = getSensorDisplay(sensor);
                    const status = getSensorStatus(sensor);
                    const locationId = getSensorLocationId(sensor);
                    return (
                      <tr
                        key={sensor.id}
                        onClick={() => setSelectedSensor(sensor)}
                        className="cursor-pointer border-b border-slate-800/80 transition-colors hover:bg-slate-800 last:border-0"
                      >
                        <td className="px-4 py-3"><StatusIcon status={status} /></td>
                        <td className="px-4 py-3">
                          <Link href={`/sensors/${sensor.id}`} className="font-medium text-white hover:text-[#26ADE4]" onClick={(e) => e.stopPropagation()}>
                            {sensor.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3"><span className="font-mono text-sm text-slate-400">{sensor.sensorId}</span></td>
                        <td className="px-4 py-3">
                          {locationId ? (
                            <Link href={`/locations/${locationId}`} className="text-sm text-slate-300 hover:text-[#26ADE4]" onClick={(e) => e.stopPropagation()}>
                              {getLocationById(locationId)?.name ?? "—"}
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-300">{getTypeLabel(sensor.type)}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-300">{display.lastReading}</span></td>
                        <td className="px-4 py-3">
                          {status === "offline" ? <span className="text-slate-500">—</span> : <SignalBar dbm={display.signalStrengthDbm} />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Battery className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-300">
                              {status === "offline" ? "—" : `${display.batteryPercent}%`}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="font-mono text-sm text-slate-400">{sensor.gatewayId}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-slate-500">{formatLastSeen(display.lastSeenMinutes)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showRegisterModal && (
        <RegisterSensorModal onClose={() => setShowRegisterModal(false)} onRegister={() => setShowRegisterModal(false)} />
      )}

      {selectedSensor && (
        <SensorSettingsSlideout
          sensor={selectedSensor}
          onClose={() => setSelectedSensor(null)}
          onSave={() => setSelectedSensor(null)}
          onUnlink={() => setSelectedSensor(null)}
        />
      )}
    </div>
  );
}
