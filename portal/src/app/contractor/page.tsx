"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { ContractorSidebar } from "@/components/ContractorSidebar";
import { useAssignment } from "@/context/AssignmentContext";
import {
  getLocationById,
  getSensorById,
  getSensorDisplay,
  MOCK_ASSETS,
  MOCK_TICKETS,
  USER_IDS,
  type Ticket,
  type TicketPriority,
} from "@/utils/mockData";

function useMyJobs() {
  const { getOverride } = useAssignment();
  return MOCK_TICKETS.filter((t) => {
    const override = getOverride(t.id);
    const effective = override !== undefined ? override : t.assignedToUserId;
    return effective === USER_IDS.JOE_THE_TECH;
  });
}
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles = {
    Low: "bg-slate-500/20 text-slate-400",
    High: "bg-amber-500/20 text-amber-400",
    Critical: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function JobDetailModal({
  ticket,
  onClose,
  onUpdateStatus,
}: {
  ticket: Ticket;
  onClose: () => void;
  onUpdateStatus: () => void;
}) {
  const location = getLocationById(ticket.locationId);
  const sensor = getSensorById(ticket.sensorId);
  const display = sensor ? getSensorDisplay(sensor) : null;
  const asset = MOCK_ASSETS.find((a) => a.assignedSensors.includes(ticket.sensorId));

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-slate-900 shadow-2xl sm:max-h-[85vh] sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700/80 p-4">
          <h2 className="text-lg font-bold text-white">{ticket.title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <ChevronRight className="h-6 w-6 rotate-180" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Location */}
          {location && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-400">Location</h3>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 rounded-lg border border-slate-700/80 bg-slate-800/50 p-4 text-left transition-colors hover:border-[#26ADE4]/50"
              >
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#26ADE4]" />
                <div>
                  <p className="font-medium text-white">{location.name}</p>
                  <p className="text-sm text-slate-400">
                    {location.address}, {location.city}, {location.state}
                  </p>
                  <p className="mt-1 text-xs text-[#26ADE4]">Open in Maps →</p>
                </div>
              </a>
            </div>
          )}

          {/* Asset History - 24h temp graph */}
          {sensor && asset && chartData.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-400">
                {asset.name} – Last 24h
              </h3>
              <div className="h-48 rounded-lg border border-slate-700/80 bg-slate-800/30 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                      }}
                      formatter={(value: number) => [`${value}°F`, ""]}
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
              <p className="mt-1 text-xs text-slate-500">
                Current: {display?.lastReading ?? sensor.displayData}
              </p>
            </div>
          )}

          {/* Notes / Chat log */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-400">Notes</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {ticket.timeline.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg border px-3 py-2 ${
                    msg.sender === "Contractor"
                      ? "ml-4 border-[#26ADE4]/40 bg-[#26ADE4]/10"
                      : "mr-4 border-slate-700/80 bg-slate-800/50"
                  }`}
                >
                  <p className="text-xs font-medium text-slate-500">{msg.sender}</p>
                  <p className="text-sm text-slate-200">{msg.text}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatTime(msg.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-700/80 p-4 flex gap-3">
          <button
            type="button"
            onClick={onUpdateStatus}
            className="flex-1 rounded-lg bg-[#26ADE4] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#26ADE4]/90"
          >
            Update Status
          </button>
          {ticket.status !== "Resolved" && (
            <button
              type="button"
              onClick={() => {
                console.log("Complete job:", ticket.id);
                onClose();
              }}
              className="flex-1 rounded-lg border border-emerald-500/60 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              Complete Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCard({
  ticket,
  onSelect,
}: {
  ticket: Ticket;
  onSelect: () => void;
}) {
  const location = getLocationById(ticket.locationId);
  const mapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${location.address}, ${location.city}, ${location.state}`
      )}`
    : "#";

  return (
    <div
      className="rounded-xl border border-slate-700/80 bg-slate-900 p-4 transition-colors hover:border-slate-600"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <span
              className={`text-xs font-medium ${
                ticket.status === "Resolved" ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {ticket.status}
            </span>
          </div>
          <h3 className="font-semibold text-white line-clamp-1">{ticket.title}</h3>
          {location && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#26ADE4]"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{location.name} · {location.address}</span>
            </a>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg bg-[#26ADE4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#26ADE4]/90"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {ticket.status === "Resolved" ? "View" : "Update"}
        </button>
      </div>
    </div>
  );
}

export default function ContractorPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const myJobs = useMyJobs();

  return (
    <div className="min-h-screen bg-slate-950">
      <ContractorSidebar />
      <main className="pb-24 pl-0 pt-16 md:pl-24 md:pb-8 md:pt-8 lg:pl-56">
        <div className="px-4 md:px-8">
          <h1 className="text-2xl font-bold text-white">My Jobs</h1>
          <p className="mt-1 text-slate-400">Work queue for field technicians</p>

          <div className="mt-6 space-y-4">
            {myJobs.length === 0 ? (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-8 text-center">
                <p className="text-slate-500">No jobs assigned to you.</p>
                <Link
                  href="/contractor/available"
                  className="mt-2 inline-block text-[#26ADE4] hover:underline"
                >
                  View available work →
                </Link>
              </div>
            ) : (
              myJobs.map((ticket) => (
                <JobCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => setSelectedTicket(ticket)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {selectedTicket && (
        <JobDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={() => {
            console.log("Update status:", selectedTicket.id);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}
