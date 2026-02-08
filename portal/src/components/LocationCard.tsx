"use client";

import { CheckCircle, AlertCircle } from "lucide-react";
import type { MonnitSensor } from "@/utils/mockData";

export interface LocationSummary {
  id: string;
  name: string;
  sensors: MonnitSensor[];
  totalSensors: number;
  avgTemperature: number;
  activeAlerts: number;
  isHealthy: boolean;
}

export function LocationCard({
  location,
  onClick,
}: {
  location: LocationSummary;
  onClick: () => void;
}) {
  const topSensors = location.sensors.slice(0, 3);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-slate-700/80 bg-slate-900 p-5 text-left transition-all hover:border-slate-600 hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-[#26ADE4]/50"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{location.name}</h3>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium ${
            location.isHealthy ? "text-[#26ADE4]" : "text-red-400"
          }`}
        >
          {location.isHealthy ? (
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
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500">Total Sensors</p>
          <p className="text-lg font-bold text-slate-100">{location.totalSensors}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Avg Temperature</p>
          <p className="text-lg font-bold text-slate-100">
            {location.avgTemperature > 0 ? `${location.avgTemperature.toFixed(1)}°F` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Active Alerts</p>
          <p
            className={`text-lg font-bold ${
              location.activeAlerts > 0 ? "text-red-400" : "text-slate-100"
            }`}
          >
            {location.activeAlerts}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-4">
        <p className="mb-2 text-xs font-medium text-slate-500">Top Sensors</p>
        <ul className="space-y-1.5">
          {topSensors.map((sensor) => (
            <li
              key={sensor.id}
              className="flex items-center justify-between text-sm text-slate-300"
            >
              <span className="truncate">{sensor.name}</span>
              <span
                className={`ml-2 shrink-0 text-xs ${
                  sensor.status === "healthy"
                    ? "text-[#26ADE4]"
                    : sensor.status === "alert"
                      ? "text-red-400"
                      : "text-slate-500"
                }`}
              >
                {sensor.status === "healthy" ? "OK" : sensor.status === "alert" ? "Alert" : "Offline"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}
