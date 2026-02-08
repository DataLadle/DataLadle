"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Asset, AssetType } from "@/utils/mockData";

interface AssetModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSave: (data: AssetFormData) => void;
  buildings: { id: string; name: string }[];
  sensors: { id: string; name: string; buildingId: string }[];
}

export interface AssetFormData {
  name: string;
  type: AssetType;
  locationId: string;
  make: string;
  model: string;
  serialNumber: string;
  installDate: string;
  assignedSensors: string[];
}

const ASSET_TYPES: AssetType[] = ["Refrigeration", "HVAC", "Power", "Plumbing"];

export function AssetModal({
  asset,
  onClose,
  onSave,
  buildings,
  sensors,
}: AssetModalProps) {
  const [form, setForm] = useState<AssetFormData>({
    name: "",
    type: "Refrigeration",
    locationId: "",
    make: "",
    model: "",
    serialNumber: "",
    installDate: "",
    assignedSensors: [],
  });

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        type: asset.type,
        locationId: asset.locationId,
        make: asset.details.make,
        model: asset.details.model,
        serialNumber: asset.details.serialNumber,
        installDate: asset.details.installDate,
        assignedSensors: [...asset.assignedSensors],
      });
    } else {
      setForm({
        name: "",
        type: "Refrigeration",
        locationId: buildings[0]?.id ?? "",
        make: "",
        model: "",
        serialNumber: "",
        installDate: "",
        assignedSensors: [],
      });
    }
  }, [asset, buildings]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const toggleSensor = (sensorId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedSensors: prev.assignedSensors.includes(sensorId)
        ? prev.assignedSensors.filter((id) => id !== sensorId)
        : [...prev.assignedSensors, sensorId],
    }));
  };

  const filteredSensors =
    form.locationId
      ? sensors.filter((s) => s.buildingId === form.locationId)
      : sensors;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-modal-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="asset-modal-title" className="text-lg font-bold text-white">
            {asset ? "Edit Asset" : "New Asset"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
              placeholder="e.g. Walk-in Freezer B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as AssetType }))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Location</label>
            <select
              value={form.locationId}
              onChange={(e) =>
                setForm((p) => ({ ...p, locationId: e.target.value, assignedSensors: [] }))
              }
              required
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
            >
              <option value="">Select location</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400">Make</label>
              <input
                type="text"
                value={form.make}
                onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                placeholder="e.g. Sub-Zero"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Model</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                placeholder="e.g. BI-36U"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Serial Number</label>
            <input
              type="text"
              value={form.serialNumber}
              onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
              placeholder="e.g. SZ-2024-1129"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">Install Date</label>
            <input
              type="text"
              value={form.installDate}
              onChange={(e) => setForm((p) => ({ ...p, installDate: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">
              Link Sensors
            </label>
            <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-600 bg-slate-800/50 p-3">
              {filteredSensors.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Select a location first to see sensors.
                </p>
              ) : (
                filteredSensors.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={form.assignedSensors.includes(s.id)}
                      onChange={() => toggleSensor(s.id)}
                      className="rounded border-slate-600 focus:ring-[#26ADE4]"
                    />
                    {s.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
            >
              {asset ? "Save Changes" : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
