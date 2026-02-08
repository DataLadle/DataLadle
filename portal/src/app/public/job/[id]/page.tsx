"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MapPin, CheckCircle } from "lucide-react";
import {
  getTicketDetails,
  getSensorDisplay,
} from "@/utils/mockData";
import {
  getPublicJobAcceptance,
  setPublicJobAcceptance,
  markPublicJobComplete,
} from "@/utils/publicJobAcceptance";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PublicJobPage() {
  const params = useParams();
  const id = params.id as string;
  const [technicianName, setTechnicianName] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !id || typeof id !== "string") {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-lg animate-pulse rounded-2xl bg-slate-100 p-8">
          <div className="h-6 w-3/4 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  const details = getTicketDetails(id);
  const stored = getPublicJobAcceptance(id);

  const isAssigned = Boolean(details?.ticket.assignedToUserId);
  const hasAccepted = Boolean(stored) || accepted;
  const showWorkOrder = isAssigned || hasAccepted;
  const isComplete = stored?.completedAt ?? completed;

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicianName.trim() || !phone.trim()) return;
    setPublicJobAcceptance(id, { technicianName: technicianName.trim(), phone: phone.trim() });
    setAccepted(true);
  };

  const handleMarkComplete = () => {
    markPublicJobComplete(id);
    setCompleted(true);
  };

  if (!details) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-lg rounded-2xl border-2 border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-lg font-medium text-slate-700">Job not found</p>
          <p className="mt-2 text-sm text-slate-500">This work order may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const { ticket, sensor, location, asset, triggeringAlert, timeline } = details;
  const display = sensor ? getSensorDisplay(sensor) : null;

  const chartData =
    sensor?.history.map((p) => ({
      ...p,
      time: new Date(p.timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })) ?? [];

  const mapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${location.address}, ${location.city}, ${location.state}`
      )}`
    : "#";

  // State 1: Job Offer
  if (!showWorkOrder) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold text-slate-900">Data Ladle</h1>
            <p className="mt-1 text-sm text-slate-600">Maintenance Work Order</p>
          </div>

          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900">
              Maintenance Request at {location?.name ?? "Site"}
            </h2>
            <p className="mt-3 text-base text-slate-700">{ticket.title}</p>
            {triggeringAlert && (
              <p className="mt-2 text-sm text-slate-600">
                Issue: {triggeringAlert.type} {triggeringAlert.value} (threshold: {triggeringAlert.threshold})
              </p>
            )}

            <form onSubmit={handleAccept} className="mt-6 space-y-4">
              <div>
                <label htmlFor="tech-name" className="block text-sm font-semibold text-slate-800">
                  Technician Name
                </label>
                <input
                  id="tech-name"
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-[#26ADE4] focus:outline-none focus:ring-2 focus:ring-[#26ADE4]/30"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="tech-phone" className="block text-sm font-semibold text-slate-800">
                  Phone Number
                </label>
                <input
                  id="tech-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1.5 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-[#26ADE4] focus:outline-none focus:ring-2 focus:ring-[#26ADE4]/30"
                  placeholder="(555) 123-4567"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#26ADE4] py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-[#1e9bc9] active:scale-[0.98]"
              >
                Accept Job
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Active Work Order (or Completed)
  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Data Ladle</h1>
          <p className="mt-1 text-sm text-slate-600">Work Order</p>
        </div>

        {isComplete ? (
          <div className="mb-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
            <CheckCircle className="mx-auto h-14 w-14 text-emerald-600" />
            <p className="mt-3 text-lg font-bold text-emerald-800">Job Complete</p>
            <p className="mt-1 text-sm text-emerald-700">Thank you for completing this work order.</p>
          </div>
        ) : (
          <>
            {/* Asset Context */}
            <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-lg">
              {location?.image && (
                <img
                  src={location.image}
                  alt={location.name}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {asset?.name ?? ticket.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{location?.name}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-base font-semibold text-[#26ADE4]"
                >
                  <MapPin className="h-5 w-5" />
                  Open in Maps
                </a>
              </div>
            </div>

            {/* Evidence: 24h Trend */}
            {sensor && chartData.length > 0 && (
              <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
                <h3 className="mb-3 text-base font-bold text-slate-900">24-Hour Trend</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: number) => [
                          sensor.type === "Humidity" ? `${value}%` : `${value}°F`,
                          "",
                        ]}
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
                {display && (
                  <p className="mt-2 text-sm text-slate-600">
                    Current: {display.lastReading}
                  </p>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="mb-6 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
              <h3 className="mb-3 text-base font-bold text-slate-900">Timeline</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {timeline.map((event, i) => {
                  if (event.type === "rule_triggered") {
                    return (
                      <div key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                        <span className="text-sm text-slate-500">{formatTime(event.timestamp)}</span>
                        <p className="text-sm text-slate-800">
                          Rule [{event.ruleName}] Triggered
                        </p>
                      </div>
                    );
                  }
                  if (event.type === "ticket_created") {
                    return (
                      <div key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                        <span className="text-sm text-slate-500">{formatTime(event.timestamp)}</span>
                        <p className="text-sm text-slate-800">Ticket Created</p>
                      </div>
                    );
                  }
                  if (event.type === "dispatched") {
                    return (
                      <div key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                        <span className="text-sm text-slate-500">{formatTime(event.timestamp)}</span>
                        <p className="text-sm text-slate-800">Dispatched to {event.contractorName}</p>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">{event.sender}</p>
                      <p className="text-sm text-slate-800">{event.text}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(event.timestamp)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mark Complete */}
            <button
              type="button"
              onClick={handleMarkComplete}
              className="w-full rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-emerald-700 active:scale-[0.98]"
            >
              Mark Job Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
