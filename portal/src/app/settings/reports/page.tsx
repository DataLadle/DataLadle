"use client";

import { useState } from "react";
import { Thermometer, Activity, AlertTriangle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ReportPreview, type ReportData, type ReportType } from "@/components/ReportPreview";
import {
  MOCK_SENSORS,
  MOCK_LOCATIONS,
  MOCK_ALERTS,
  getSensorDisplay,
  getSensorStatus,
  getSensorLocationId,
  getSensorsByLocation,
} from "@/utils/mockData";

const REPORT_TYPES: { id: ReportType; label: string; icon: React.ElementType }[] = [
  { id: "compliance", label: "Compliance Check", icon: Thermometer },
  { id: "health", label: "System Health", icon: Activity },
  { id: "incident", label: "Incident Summary", icon: AlertTriangle },
];

const DATE_PRESETS = [
  { id: "7", label: "Last 7 Days" },
  { id: "30", label: "Last 30 Days" },
  { id: "custom", label: "Custom" },
];

function generateReport(
  type: ReportType,
  locationId: string,
  dateRange: string
): ReportData {
  const location = locationId === "all" ? null : MOCK_LOCATIONS.find((l) => l.id === locationId);
  const locationName = location?.name ?? "All Locations";
  const clientName = "Acme Corp";
  const generatedAt = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (type === "compliance") {
    const sensors =
      locationId === "all"
        ? MOCK_SENSORS.filter((s) => s.type === "Temperature" || s.type === "Humidity")
        : getSensorsByLocation(locationId).filter(
            (s) => s.type === "Temperature" || s.type === "Humidity"
          );

    return {
      type: "compliance",
      clientName,
      location: locationName,
      dateRange,
      generatedAt,
      columns: ["Sensor", "Location", "Min", "Max", "Avg", "Unit"],
      rows: sensors.map((s) => {
        const numVal = Number(s.data);
        const hasNum = !Number.isNaN(numVal);
        const min = hasNum ? (s.type === "Temperature" ? numVal - 5 : numVal - 10) : "—";
        const max = hasNum ? (s.type === "Temperature" ? numVal + 3 : numVal + 5) : "—";
        const unit = s.type === "Temperature" ? "°F" : "%";
        return {
          Sensor: s.name,
          Location: s.location,
          Min: hasNum ? `${min}${unit}` : "—",
          Max: hasNum ? `${max}${unit}` : "—",
          Avg: s.displayData,
          Unit: unit,
        };
      }),
    };
  }

  if (type === "health") {
    const sensors =
      locationId === "all"
        ? MOCK_SENSORS
        : getSensorsByLocation(locationId);

    return {
      type: "health",
      clientName,
      location: locationName,
      dateRange,
      generatedAt,
      columns: ["Sensor", "Battery %", "Signal (dBm)", "Status"],
      rows: sensors.map((s) => {
        const d = getSensorDisplay(s);
        return {
          Sensor: s.name,
          "Battery %": d.batteryPercent,
          "Signal (dBm)": d.signalStrengthDbm,
          Status: d.status,
        };
      }),
    };
  }

  const alerts =
    locationId === "all"
      ? MOCK_ALERTS
      : MOCK_ALERTS.filter((a) => {
          const sensor = MOCK_SENSORS.find((s) => s.id === a.sensorId);
          if (!sensor) return false;
          const locId = getSensorLocationId(sensor);
          return locId === locationId;
        });

  const sensorsForAlert = (id: string) => MOCK_SENSORS.find((s) => s.id === id);

  return {
    type: "incident",
    clientName,
    location: locationName,
    dateRange,
    generatedAt,
    columns: ["Alert ID", "Sensor", "Type", "Value", "Threshold", "Status", "Time"],
    rows: alerts.map((a) => {
      const sensor = sensorsForAlert(a.sensorId);
      return {
        "Alert ID": a.id,
        Sensor: sensor?.name ?? a.sensorId,
        Type: a.type,
        Value: a.value,
        Threshold: a.threshold,
        Status: a.status,
        Time: new Date(a.timestamp).toLocaleString(),
      };
    }),
  };
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("compliance");
  const [datePreset, setDatePreset] = useState("7");
  const [locationId, setLocationId] = useState("all");
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const dateRange =
    datePreset === "7" ? "Last 7 Days" : datePreset === "30" ? "Last 30 Days" : "Custom Range";

  const handleGenerate = () => {
    setReportData(generateReport(reportType, locationId, dateRange));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="no-print mb-8">
            <h2 className="text-2xl font-bold text-white">Reports</h2>
            <p className="mt-1 text-slate-400">Generate compliance and health reports</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="no-print lg:col-span-1">
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
                <h3 className="mb-4 font-semibold text-white">Report Configuration</h3>
                <div className="mb-6">
                  <p className="mb-3 text-sm font-medium text-slate-400">Report Type</p>
                  <div className="space-y-2">
                    {REPORT_TYPES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setReportType(id)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                          reportType === id
                            ? "border-[#26ADE4] bg-[#26ADE4]/10 text-[#26ADE4]"
                            : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="mb-3 text-sm font-medium text-slate-400">Date Range</p>
                  <div className="space-y-2">
                    {DATE_PRESETS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDatePreset(id)}
                        className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                          datePreset === id
                            ? "border-[#26ADE4] bg-[#26ADE4]/10 text-[#26ADE4]"
                            : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="mb-3 text-sm font-medium text-slate-400">Location</p>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                  >
                    <option value="all">All Locations</option>
                    {MOCK_LOCATIONS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full rounded-lg bg-[#26ADE4] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
                >
                  Generate Report
                </button>
              </div>
            </div>
            <div className="lg:col-span-2">
              <ReportPreview data={reportData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
