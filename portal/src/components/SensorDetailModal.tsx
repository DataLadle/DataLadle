"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSensorDisplay, type MonnitSensor } from "@/utils/mockData";
import { Wifi, Battery, Clock } from "lucide-react";

interface SensorDetailModalProps {
  sensor: MonnitSensor | null;
  onClose: () => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
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

export function SensorDetailModal({ sensor, onClose }: SensorDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!sensor) return null;

  const display = getSensorDisplay(sensor);
  const isOnline = display.status !== "offline";
  const chartData = sensor.history.map((p) => ({
    ...p,
    time: formatChartTime(p.timestamp),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-white">
              {sensor.name}
            </h2>
            <span
              className={`mt-1 inline-block text-sm font-medium ${
                isOnline ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chart */}
        <div className="mb-6 h-64">
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
                formatter={(value: number) => [`${value}°F`, "Temperature"]}
              />
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

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Signal Strength</span>
            </div>
            <p className="mt-1 text-lg font-bold text-white">
              {display.signalStrengthDbm} dBm
            </p>
          </div>
          <div className="rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Battery className="h-4 w-4" />
              <span className="text-sm font-medium">Battery Level</span>
            </div>
            <p className="mt-1 text-lg font-bold text-white">
              {display.batteryPercent}%
            </p>
          </div>
          <div className="rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Last Seen</span>
            </div>
            <p className="mt-1 text-lg font-bold text-white">
              {formatTime(display.lastSeenTimestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
