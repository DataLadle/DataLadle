"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, List, LayoutGrid, Pencil } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { AssetCard } from "@/components/AssetCard";
import { AssetModal, type AssetFormData } from "@/components/AssetModal";
import {
  MOCK_ASSETS,
  MOCK_SENSORS,
  MOCK_LOCATIONS,
  getSensorStatus,
  getSensorLocationId,
  type Asset,
} from "@/utils/mockData";

const STATUS_STYLES = {
  Operational: "bg-emerald-500/20 text-emerald-400",
  "Maintenance Required": "bg-amber-500/20 text-amber-400",
  "Out of Service": "bg-red-500/20 text-red-400",
};

export default function AssetsPage() {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleNewAsset = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAsset(null);
  };

  const handleSave = (data: AssetFormData) => {
    console.log("Save asset:", data);
    handleCloseModal();
  };

  const getSensorName = (id: string) => MOCK_SENSORS.find((s) => s.id === id)?.name ?? id;
  const getLocationName = (id: string) => MOCK_LOCATIONS.find((b) => b.id === id)?.name ?? "—";
  const getSensorStatusMap = (ids: string[]) =>
    Object.fromEntries(ids.map((id) => {
      const s = MOCK_SENSORS.find((x) => x.id === id);
      return [id, s ? getSensorStatus(s) : "offline" as const];
    }));

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Assets</h2>
              <p className="mt-1 text-slate-400">Physical equipment and monitoring</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border border-slate-700/80 bg-slate-800/50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded-md p-2 transition-colors ${
                    viewMode === "table"
                      ? "bg-[#26ADE4]/20 text-[#26ADE4]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  aria-label="Table view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`rounded-md p-2 transition-colors ${
                    viewMode === "cards"
                      ? "bg-[#26ADE4]/20 text-[#26ADE4]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  aria-label="Card view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleNewAsset}
                className="flex items-center gap-2 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
              >
                <Plus className="h-4 w-4" />
                New Asset
              </button>
            </div>
          </div>

          {viewMode === "table" ? (
            <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Asset Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Sensors
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ASSETS.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-800/80 transition-colors hover:bg-slate-800/30 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{asset.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {asset.type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_STYLES[asset.status]
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/locations/${asset.locationId}`}
                          className="text-sm text-[#26ADE4] hover:underline"
                        >
                          {getLocationName(asset.locationId)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {asset.assignedSensors.length === 0 ? (
                            <span className="text-sm text-slate-500">—</span>
                          ) : (
                            asset.assignedSensors.map((sensorId) => {
                              const s = MOCK_SENSORS.find((x) => x.id === sensorId);
                              const status = s ? getSensorStatus(s) : "offline";
                              const dot =
                                status === "healthy"
                                  ? "bg-emerald-500"
                                  : status === "alert"
                                    ? "bg-amber-500"
                                    : "bg-slate-500";
                              return (
                                <Link
                                  key={sensorId}
                                  href={`/sensors/${sensorId}`}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/60 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600/60 hover:text-[#26ADE4]"
                                >
                                  <span
                                    className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
                                  />
                                  {getSensorName(sensorId)}
                                </Link>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleEditAsset(asset)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-[#26ADE4]"
                          aria-label="Edit asset"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_ASSETS.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  locationName={getLocationName(asset.locationId)}
                  locationId={asset.locationId}
                  sensorIds={asset.assignedSensors}
                  sensorNames={asset.assignedSensors.map(getSensorName)}
                  sensorStatuses={getSensorStatusMap(asset.assignedSensors)}
                  onEdit={() => handleEditAsset(asset)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <AssetModal
          asset={editingAsset}
          onClose={handleCloseModal}
          onSave={handleSave}
          buildings={MOCK_LOCATIONS.map((b) => ({ id: b.id, name: b.name }))}
          sensors={MOCK_SENSORS.map((s) => ({
            id: s.id,
            name: s.name,
            buildingId: getSensorLocationId(s) ?? "",
          }))}
        />
      )}
    </div>
  );
}
