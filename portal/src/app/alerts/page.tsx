"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Thermometer,
  Battery,
  Wifi,
  Droplets,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import {
  MOCK_ALERTS,
  MOCK_SENSORS,
  getSensorLocationId,
  getLocationById,
  MOCK_RULE_DEFINITIONS,
  type Alert,
  type AlertStatus,
  type AlertType,
} from "@/utils/mockData";

const TYPE_ICONS: Record<AlertType, React.ElementType> = {
  Temperature: Thermometer,
  Humidity: Droplets,
  Battery,
  Signal: Wifi,
};

function getSensorName(sensorId: string) {
  return MOCK_SENSORS.find((s) => s.id === sensorId)?.name ?? sensorId;
}

function getLocationName(sensorId: string) {
  const sensor = MOCK_SENSORS.find((s) => s.id === sensorId);
  if (!sensor) return "—";
  const locId = getSensorLocationId(sensor);
  return locId ? (getLocationById(locId)?.name ?? "—") : "—";
}

function getRuleName(ruleId: string) {
  return MOCK_RULE_DEFINITIONS.find((r) => r.id === ruleId)?.name ?? "—";
}

function formatDuration(timestamp: string) {
  const ms = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `Active for ${hours}h`;
  if (mins > 0) return `Active for ${mins}m`;
  return "Just now";
}

function getRowStyles(status: AlertStatus) {
  switch (status) {
    case "Active":
      return "border-red-500/30 bg-red-500/5";
    case "Acknowledged":
      return "border-amber-500/20 bg-amber-500/5";
    case "Resolved":
      return "border-slate-700/50 bg-slate-800/30 opacity-75";
    default:
      return "";
  }
}

function getSeverityIcon(status: AlertStatus) {
  switch (status) {
    case "Active":
      return <AlertTriangle className="h-5 w-5 text-red-400" />;
    case "Acknowledged":
      return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    case "Resolved":
      return <CheckCircle className="h-5 w-5 text-slate-500" />;
    default:
      return null;
  }
}

function CreateTicketModal({
  alert,
  onClose,
  onNavigate,
}: {
  alert: Alert;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const sensor = MOCK_SENSORS.find((s) => s.id === alert.sensorId);
  const building = sensor
    ? MOCK_BUILDINGS.find((b) => b.id === sensor.buildingId)
    : null;

  const violatedRule = getRuleName(alert.ruleId);
  const prefill = {
    sensorName: getSensorName(alert.sensorId),
    location: building?.name ?? "—",
    alertDetails: `${alert.type}: ${alert.value} (threshold: ${alert.threshold})`,
    violatedRule,
  };

  const handleCreate = () => {
    console.log("Create Ticket with prefill:", prefill);
    onNavigate();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-ticket-title"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="create-ticket-title" className="text-lg font-bold text-white">
            Create Ticket
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">
              Sensor
            </label>
            <p className="mt-1 rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-2.5 text-sm text-white">
              {prefill.sensorName}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">
              Location
            </label>
            <p className="mt-1 rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-2.5 text-sm text-white">
              {prefill.location}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">
              Violated Rule
            </label>
            <p className="mt-1 rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-2.5 text-sm text-white">
              {prefill.violatedRule}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">
              Alert Details
            </label>
            <p className="mt-1 rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-2.5 text-sm text-white">
              {prefill.alertDetails}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#26ADE4]/90"
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const router = useRouter();
  const [createTicketAlert, setCreateTicketAlert] = useState<Alert | null>(null);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Alerts</h2>
            <p className="mt-1 text-slate-400">
              Rule violations and sensor alarms
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/80">
                  <th className="w-12 px-4 py-3 text-left">
                    <span className="sr-only">Severity</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sensor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Violated Rule
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ALERTS.map((alert) => {
                  const TypeIcon = TYPE_ICONS[alert.type] ?? Thermometer;
                  const message = `${alert.type} ${alert.threshold} (current: ${alert.value})`;

                  return (
                    <tr
                      key={alert.id}
                      className={`border-b border-slate-800/80 last:border-0 ${getRowStyles(
                        alert.status
                      )}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(alert.status)}
                          <TypeIcon className="h-4 w-4 text-slate-500" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/sensors/${alert.sensorId}`}
                          className="font-medium text-slate-100 hover:text-[#26ADE4]"
                        >
                          {getSensorName(alert.sensorId)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">
                          {getRuleName(alert.ruleId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {message}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {getLocationName(alert.sensorId)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDuration(alert.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {alert.status === "Active" && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  console.log("Ignore alert:", alert.id);
                                }}
                                className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                              >
                                Ignore
                              </button>
                              <button
                                type="button"
                                onClick={() => setCreateTicketAlert(alert)}
                                className="rounded-lg bg-[#26ADE4] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#26ADE4]/90"
                              >
                                Create Ticket
                              </button>
                            </>
                          )}
                          {alert.status === "Acknowledged" && (
                            <button
                              type="button"
                              onClick={() => setCreateTicketAlert(alert)}
                              className="rounded-lg bg-[#26ADE4] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#26ADE4]/90"
                            >
                              Create Ticket
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {createTicketAlert && (
        <CreateTicketModal
          alert={createTicketAlert}
          onClose={() => setCreateTicketAlert(null)}
          onNavigate={() => router.push("/maintenance")}
        />
      )}
    </div>
  );
}
