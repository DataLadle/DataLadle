"use client";

import { useEffect } from "react";
import { X, RefreshCw, Unplug } from "lucide-react";
import { getSensorStatus, signalStrengthToDbm, type Gateway } from "@/utils/mockData";
import type { MonnitSensor } from "@/utils/mockData";

interface GatewayDetailsSlideoutProps {
  gateway: Gateway | null;
  sensors: MonnitSensor[];
  onClose: () => void;
  onReboot: (id: string) => void;
  onUnclaim: (id: string) => void;
}

function SignalBar({ dbm }: { dbm: number }) {
  const pct = Math.min(100, Math.max(0, ((dbm + 100) / 50) * 100));
  const color =
    dbm >= -60 ? "bg-emerald-500" : dbm >= -80 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-400">{dbm} dBm</span>
    </div>
  );
}

export function GatewayDetailsSlideout({
  gateway,
  sensors,
  onClose,
  onReboot,
  onUnclaim,
}: GatewayDetailsSlideoutProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!gateway) return null;

  const connectedSensors = sensors.filter((s) => s.gatewayId === gateway.id);

  const handleUnclaim = () => {
    if (
      confirm(
        "Are you sure you want to unclaim this gateway? All linked sensors will need to be reassigned."
      )
    ) {
      onUnclaim(gateway.id);
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-slate-700/80 bg-slate-900 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gateway-details-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/80 bg-slate-900 px-6 py-4">
          <h2 id="gateway-details-title" className="text-lg font-bold text-white">
            Gateway Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-4 rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
            <div>
              <p className="text-xs text-slate-500">Gateway ID</p>
              <p className="font-mono text-sm text-white">{gateway.physicalId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Name</p>
              <p className="text-sm text-white">{gateway.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Type</p>
              <p className="text-sm text-slate-300">{gateway.type}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Network ID</p>
              <p className="font-mono text-sm text-slate-300">{gateway.networkId}</p>
            </div>
            {gateway.signalStrength != null && (
              <div>
                <p className="text-xs text-slate-500">Signal</p>
                <SignalBar dbm={gateway.signalStrength <= 100 ? signalStrengthToDbm(gateway.signalStrength) : gateway.signalStrength} />
              </div>
            )}
          </div>

          <h3 className="mb-3 font-semibold text-white">Connected Sensors</h3>
          <ul className="mb-6 space-y-2">
            {connectedSensors.length === 0 ? (
              <li className="rounded-lg border border-slate-700/80 bg-slate-800/30 px-4 py-3 text-sm text-slate-500">
                No sensors linked
              </li>
            ) : (
              connectedSensors.map((sensor) => {
                const status = getSensorStatus(sensor);
                return (
                  <li
                    key={sensor.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-800/30 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{sensor.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{sensor.sensorId}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        status === "healthy"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : status === "alert"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {status}
                    </span>
                  </li>
                );
              })
            )}
          </ul>

          <div className="space-y-3 border-t border-slate-700/80 pt-6">
            <button
              type="button"
              onClick={() => onReboot(gateway.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
            >
              <RefreshCw className="h-4 w-4" />
              Reboot Gateway
            </button>
            <button
              type="button"
              onClick={handleUnclaim}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Unplug className="h-4 w-4" />
              Unclaim
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
