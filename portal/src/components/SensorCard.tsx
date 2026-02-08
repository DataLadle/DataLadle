"use client";

import {
  Thermometer,
  Droplets,
  DoorClosed,
  Droplet,
  Battery,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { getSensorDisplay, type MonnitSensor } from "@/utils/mockData";

const TYPE_ICONS: Record<string, React.ElementType> = {
  Temperature: Thermometer,
  Humidity: Droplets,
  "Door/Window": DoorClosed,
  "Water Leak": Droplet,
};

interface SensorCardProps {
  sensor: MonnitSensor;
  onClick: () => void;
}

export function SensorCard({ sensor, onClick }: SensorCardProps) {
  const display = getSensorDisplay(sensor);
  const Icon = TYPE_ICONS[sensor.type] ?? Thermometer;
  const isOffline = display.status === "offline";
  const isAlert = display.status === "alert";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border bg-slate-900 p-5 text-left transition-all hover:border-[#26ADE4]/50 ${
        isOffline
          ? "opacity-50 border-slate-700"
          : isAlert
            ? "border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            : "border-slate-700/80 hover:border-slate-600"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isOffline ? "bg-slate-700 text-slate-500" : isAlert ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Battery className="h-4 w-4" />
          <span>{isOffline ? "—" : `${display.batteryPercent}%`}</span>
        </div>
      </div>

      <h3 className="mt-4 font-semibold text-slate-100 line-clamp-1">{sensor.name}</h3>
      <p className="mt-1 text-xs text-slate-500">{sensor.location}</p>

      <div className="mt-4 flex items-end justify-between">
        <span className="text-2xl font-bold text-slate-100">
          {display.lastReading}
        </span>
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              Offline
            </span>
          ) : isAlert ? (
            <span className="flex items-center gap-1 text-xs font-medium text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Alert
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Healthy
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
