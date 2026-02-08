"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Phone, Mail, Send, Share2, CheckCircle, HelpCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import {
  getTicketDetails,
  getSensorDisplay,
  type TicketDetailTimelineEvent,
} from "@/utils/mockData";
import {
  isTicketEscalated,
  isTicketResolvedByClient,
  escalateTicket,
  resolveTicketByClient,
  getEffectiveTicketStatus,
} from "@/utils/ticketEscalation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DispatchStatus = "Pending" | "Dispatched" | "On-Site" | "Completed";

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

function TimelineEventRow({ event }: { event: TicketDetailTimelineEvent }) {
  if (event.type === "rule_triggered") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-3">
        <span className="shrink-0 text-sm text-slate-500">{formatTime(event.timestamp)}</span>
        <p className="text-sm text-slate-200">
          Rule <span className="font-medium text-amber-400">[{event.ruleName}]</span> Triggered.
        </p>
      </div>
    );
  }
  if (event.type === "ticket_created") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-3">
        <span className="shrink-0 text-sm text-slate-500">{formatTime(event.timestamp)}</span>
        <p className="text-sm text-slate-200">Ticket Created automatically.</p>
      </div>
    );
  }
  if (event.type === "dispatched") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-3">
        <span className="shrink-0 text-sm text-slate-500">{formatTime(event.timestamp)}</span>
        <p className="text-sm text-slate-200">
          Dispatched to <span className="font-medium text-[#26ADE4]">{event.contractorName}</span>.
        </p>
      </div>
    );
  }
  const msg = event;
  const isContractor = msg.sender === "Contractor";
  const isDataLadle = msg.sender === "Data Ladle";
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        isDataLadle ? "ml-auto max-w-[85%] border-[#26ADE4]/40 bg-[#26ADE4]/10" : "border-slate-700/80 bg-slate-800/50"
      } ${isContractor ? "border-slate-600" : ""}`}
    >
      <p className="text-xs font-medium text-slate-500">{msg.sender}</p>
      <p className="mt-1 text-sm text-slate-200">{msg.text}</p>
      <p className="mt-1 text-xs text-slate-500">{formatDateTime(msg.timestamp)}</p>
    </div>
  );
}

export default function MaintenanceDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const { currentUser } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState<DispatchStatus>("On-Site");
  const [shareCopied, setShareCopied] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const details = getTicketDetails(ticketId);
  if (!details) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Sidebar />
        <div className="pl-56">
          <TopBar />
          <main className="p-8">
            <p className="text-slate-400">Work order not found.</p>
            <Link
              href="/maintenance"
              className="mt-4 inline-flex items-center gap-1 text-[#26ADE4] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Maintenance
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const { ticket, sensor, location, asset, contractor, triggeringAlert, rule, timeline } = details;
  const display = sensor ? getSensorDisplay(sensor) : null;
  const effectiveStatus = getEffectiveTicketStatus(ticketId, ticket.status);
  const isClient = currentUser?.role === "client";
  const showClientActions =
    isClient &&
    effectiveStatus !== "Resolved" &&
    !isTicketResolvedByClient(ticketId);

  const chartData =
    sensor?.history.map((p) => ({
      ...p,
      time: new Date(p.timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })) ?? [];

  const formatReading = (val: number) =>
    sensor?.type === "Humidity" ? `${val}%` : `${val}°F`;

  const recentReadings = (sensor?.history ?? [])
    .slice(-5)
    .reverse()
    .map((p) => ({
      time: formatDateTime(p.timestamp),
      value: formatReading(p.temperature),
    }));

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/maintenance"
              className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-[#26ADE4]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Maintenance
            </Link>
            <button
              type="button"
              onClick={async () => {
                const url = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/public/job/${ticketId}`;
                await navigator.clipboard.writeText(url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#26ADE4]/50 bg-[#26ADE4]/10 px-4 py-2 text-sm font-medium text-[#26ADE4] transition-colors hover:bg-[#26ADE4]/20"
            >
              <Share2 className="h-4 w-4" />
              {shareCopied ? "Copied!" : "Share Job"}
            </button>
          </div>

          {/* Toast */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-emerald-500/40 bg-emerald-950/95 px-4 py-3 text-sm font-medium text-emerald-400 shadow-lg">
              {toastMessage}
            </div>
          )}

          {/* Client Action Bar */}
          {showClientActions && (
            <div className="mb-6 rounded-xl border border-slate-700/80 bg-slate-900 p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-400">
                Client Actions
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                >
                  <CheckCircle className="h-5 w-5" />
                  Mark Resolved
                </button>
                {currentUser?.planType === "premium" ? (
                  <button
                    type="button"
                    onClick={() => {
                      escalateTicket(ticketId);
                      setToastMessage(
                        "Support Notified. We will review this shortly."
                      );
                      setTimeout(() => setToastMessage(null), 4000);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-500/60 bg-transparent px-5 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/10"
                  >
                    <HelpCircle className="h-5 w-5" />
                    Escalate to Support
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">
                    Need help? Contact Admin to upgrade to Managed Support.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mark Resolved Modal */}
          {resolveModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setResolveModalOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="w-full max-w-md rounded-xl border border-slate-700/80 bg-slate-900 p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-white">
                  Mark Resolved
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Add a resolution note (e.g., &quot;Door was ajar&quot;)
                </p>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Resolution note..."
                  rows={3}
                  className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                />
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (resolutionNote.trim()) {
                        resolveTicketByClient(ticketId, resolutionNote.trim());
                        setResolveModalOpen(false);
                        setResolutionNote("");
                      }
                    }}
                    className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                  >
                    Close Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolveModalOpen(false)}
                    className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Brief */}
          <div className="mb-6 rounded-xl border border-slate-700/80 bg-slate-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
              {effectiveStatus === "Escalated" && (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
                  Escalated
                </span>
              )}
              {effectiveStatus === "Resolved" && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400">
                  Resolved
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500">Asset: </span>
                <span className="font-medium text-white">{asset?.name ?? "—"}</span>
              </div>
              <div>
                <span className="text-slate-500">Location: </span>
                <span className="font-medium text-white">{location?.name ?? "—"}</span>
              </div>
            </div>
            {sensor && display && triggeringAlert && (
              <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
                <div>
                  <p className="text-xs text-slate-500">Live Snapshot</p>
                  <p className="text-lg font-bold text-white">
                    Current: {display.lastReading} vs Threshold: {triggeringAlert.threshold}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Main: Data Evidence + Timeline */}
            <div className="min-w-0 flex-1 space-y-6">
              {/* Data Evidence */}
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-6">
                <h2 className="mb-4 font-semibold text-white">Data Evidence</h2>
                {sensor && chartData.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-slate-400">24-Hour Trend</h3>
                      <div className="h-64 rounded-lg border border-slate-700/80 bg-slate-800/30 p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                            <XAxis
                              dataKey="time"
                              stroke="#94a3b8"
                              fontSize={10}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#94a3b8"
                              fontSize={10}
                              tickLine={false}
                              domain={["auto", "auto"]}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "6px",
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
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-slate-400">
                        Recent Readings (last 5)
                      </h3>
                      <div className="overflow-hidden rounded-lg border border-slate-700/80">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-700/80 bg-slate-800/50">
                              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">
                                Time
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-slate-400">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentReadings.map((r, i) => (
                              <tr
                                key={i}
                                className="border-b border-slate-800/80 last:border-0"
                              >
                                <td className="px-4 py-2 text-sm text-slate-300">{r.time}</td>
                                <td className="px-4 py-2 text-sm font-medium text-white">
                                  {r.value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No sensor data available.</p>
                )}
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-slate-700/80 bg-slate-900">
                <div className="border-b border-slate-700/80 px-6 py-4">
                  <h2 className="font-semibold text-white">Timeline</h2>
                </div>
                <div className="flex max-h-[480px] flex-col overflow-hidden">
                  <div className="flex-1 space-y-3 overflow-y-auto p-6">
                    {timeline.map((event, i) => (
                      <TimelineEventRow key={i} event={event} />
                    ))}
                  </div>
                  <div className="border-t border-slate-700/80 p-4">
                    <p className="mb-2 text-xs font-medium text-slate-500">User Comments</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add note or reply..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#26ADE4] focus:outline-none focus:ring-1 focus:ring-[#26ADE4]"
                      />
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg bg-[#26ADE4] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#26ADE4]/90"
                      >
                        <Send className="h-4 w-4" />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Contractor Assignment */}
            <div className="w-full shrink-0 lg:w-80">
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-5">
                <h3 className="mb-4 font-semibold text-white">Contractor Assignment</h3>
                {contractor ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-medium text-white">{contractor.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Company</p>
                      <p className="text-slate-200">{contractor.company}</p>
                    </div>
                    {contractor.phone && (
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <a
                          href={`tel:${contractor.phone}`}
                          className="flex items-center gap-2 text-[#26ADE4] hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {contractor.phone}
                        </a>
                      </div>
                    )}
                    {contractor.email && (
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <a
                          href={`mailto:${contractor.email}`}
                          className="flex items-center gap-2 text-[#26ADE4] hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {contractor.email}
                        </a>
                      </div>
                    )}
                    <div className="pt-2">
                      <p className="mb-2 text-xs text-slate-500">Status</p>
                      <div className="flex flex-wrap gap-1">
                        {(["Pending", "Dispatched", "On-Site", "Completed"] as const).map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setDispatchStatus(status)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                dispatchStatus === status
                                  ? "bg-[#26ADE4] text-white"
                                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              }`}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Unassigned</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
