"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle, AlertTriangle, WifiOff } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { RegisterGatewayModal } from "@/components/RegisterGatewayModal";
import { GatewayDetailsSlideout } from "@/components/GatewayDetailsSlideout";
import { MOCK_GATEWAYS, MOCK_SENSORS, MOCK_BUILDINGS, type Gateway } from "@/utils/mockData";

function getGatewayLocation(gatewayId: string): string | null {
  const sensor = MOCK_SENSORS.find((s) => s.gatewayId === gatewayId);
  return sensor?.buildingId ?? null;
}

function getLocationName(buildingId: string) {
  return MOCK_BUILDINGS.find((b) => b.id === buildingId)?.name ?? "—";
}

function StatusIcon({ status }: { status: Gateway["status"] }) {
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

function TypeBadge({ type }: { type: Gateway["type"] }) {
  const styles = {
    Ethernet: "bg-slate-600/80 text-slate-200",
    "Cellular 4G": "bg-amber-500/20 text-amber-400",
    WiFi: "bg-slate-600/60 text-slate-300",
  };
  const labels = {
    Ethernet: "Eth",
    "Cellular 4G": "4G",
    WiFi: "WiFi",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[type]
      }`}
    >
      {labels[type]}
    </span>
  );
}

function SignalCell({ gateway }: { gateway: Gateway }) {
  if (gateway.type === "Ethernet") {
    return <span className="text-slate-500">—</span>;
  }
  if (gateway.status === "Offline" || gateway.signalStrength == null) {
    return <span className="text-slate-500">—</span>;
  }
  const dbm = gateway.signalStrength;
  const pct = Math.min(100, Math.max(0, ((dbm + 100) / 50) * 100));
  const color =
    dbm >= -60 ? "bg-emerald-500" : dbm >= -80 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-10 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-400">{dbm} dBm</span>
    </div>
  );
}

function formatLastHeartbeat(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function GatewaysPage() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);

  const handleRegister = (gatewayId: string, securityCode: string) => {
    console.log("Register gateway:", { gatewayId, securityCode });
    setShowRegisterModal(false);
  };

  const handleReboot = (id: string) => {
    console.log("Reboot gateway:", id);
  };

  const handleUnclaim = (id: string) => {
    console.log("Unclaim gateway:", id);
    setSelectedGateway(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Gateways</h2>
              <p className="mt-1 text-slate-400">
                IoT hubs and gateway management
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
            >
              <Plus className="h-4 w-4" />
              Register Gateway
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-700/80">
                    <th className="w-12 px-4 py-3 text-left">
                      <span className="sr-only">Status</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Gateway ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Signal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Sensors
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Last Heartbeat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_GATEWAYS.map((gateway) => {
                    const locationId = getGatewayLocation(gateway.id);
                    return (
                    <tr
                      key={gateway.id}
                      onClick={() => setSelectedGateway(gateway)}
                      className="cursor-pointer border-b border-slate-800/80 transition-colors hover:bg-slate-800 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <StatusIcon status={gateway.status} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{gateway.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-slate-400">
                          {gateway.physicalId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {locationId ? (
                          <Link
                            href={`/locations/${locationId}`}
                            className="text-sm text-slate-300 hover:text-[#26ADE4]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getLocationName(locationId)}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={gateway.type} />
                      </td>
                      <td className="px-4 py-3">
                        <SignalCell gateway={gateway} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">
                          {gateway.sensorCount} Linked
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500">
                          {formatLastHeartbeat(gateway.lastSeen)}
                        </span>
                      </td>
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
        <RegisterGatewayModal
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegister}
        />
      )}

      {selectedGateway && (
        <GatewayDetailsSlideout
          gateway={selectedGateway}
          sensors={MOCK_SENSORS}
          onClose={() => setSelectedGateway(null)}
          onReboot={handleReboot}
          onUnclaim={handleUnclaim}
        />
      )}
    </div>
  );
}
