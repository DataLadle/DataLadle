"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { MonnitSensor } from "@/utils/mockData";

const HEARTBEAT_OPTIONS = ["5 min", "10 min", "15 min", "30 min", "60 min", "120 min"];

interface SensorSettingsSlideoutProps {
  sensor: MonnitSensor | null;
  onClose: () => void;
  onSave: (id: string, data: { name: string; heartbeat: string; thresholdMin?: string; thresholdMax?: string }) => void;
  onUnlink: (id: string) => void;
}

export function SensorSettingsSlideout({
  sensor,
  onClose,
  onSave,
  onUnlink,
}: SensorSettingsSlideoutProps) {
  const [name, setName] = useState("");
  const [heartbeat, setHeartbeat] = useState("");
  const [thresholdMin, setThresholdMin] = useState("");
  const [thresholdMax, setThresholdMax] = useState("");

  useEffect(() => {
    if (sensor) {
      setName(sensor.name);
      setHeartbeat(sensor.heartbeat ?? "10 min");
      setThresholdMin(sensor.thresholdMin ?? "");
      setThresholdMax(sensor.thresholdMax ?? "");
    }
  }, [sensor]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!sensor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sensor.id, {
      name,
      heartbeat,
      thresholdMin: thresholdMin || undefined,
      thresholdMax: thresholdMax || undefined,
    });
    onClose();
  };

  const handleUnlink = () => {
    if (confirm("Are you sure you want to unlink this sensor? This action cannot be undone.")) {
      onUnlink(sensor.id);
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
        aria-labelledby="sensor-settings-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/80 bg-slate-900 px-6 py-4">
          <h2 id="sensor-settings-title" className="text-lg font-bold text-white">
            Sensor Settings
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
          <div className="mb-6 rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500">Sensor ID</p>
            <p className="font-mono text-sm text-white">{sensor.sensorId}</p>
            <p className="mt-2 text-xs text-slate-500">Type</p>
            <p className="text-sm text-slate-300">{sensor.type}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">Heartbeat</label>
              <select
                value={heartbeat}
                onChange={(e) => setHeartbeat(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
              >
                {HEARTBEAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {(sensor.type === "Temperature" || sensor.type === "Humidity") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400">Threshold Min</label>
                  <input
                    type="text"
                    value={thresholdMin}
                    onChange={(e) => setThresholdMin(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                    placeholder={sensor.unit || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Threshold Max</label>
                  <input
                    type="text"
                    value={thresholdMax}
                    onChange={(e) => setThresholdMax(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                    placeholder={sensor.unit || ""}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-slate-700/80 pt-6">
            <button
              type="button"
              onClick={handleUnlink}
              className="w-full rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              Unlink Sensor
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
