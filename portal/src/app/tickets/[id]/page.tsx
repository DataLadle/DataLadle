"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Thermometer, Battery, Send } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import {
  MOCK_TICKETS,
  MOCK_SENSORS,
  MOCK_BUILDINGS,
  type Ticket,
  type TicketStatus,
  type TimelineSender,
} from "@/utils/mockData";

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles = {
    Open: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    "In Progress": "bg-[#26ADE4]/20 text-[#26ADE4] border-[#26ADE4]/40",
    Resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status]
      }`}
    >
      {status}
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

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const [newNote, setNewNote] = useState("");

  const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
  const sensor = ticket ? MOCK_SENSORS.find((s) => s.id === ticket.sensorId) : null;
  const building = ticket ? MOCK_BUILDINGS.find((b) => b.id === ticket.locationId) : null;

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Sidebar />
        <div className="pl-56">
          <TopBar />
          <main className="p-8">
            <p className="text-slate-400">Ticket not found.</p>
            <Link
              href="/tickets"
              className="mt-4 inline-flex items-center gap-1 text-[#26ADE4] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Tickets
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const getMessageStyles = (sender: TimelineSender) => {
    switch (sender) {
      case "Data Ladle":
        return "ml-auto bg-[#26ADE4]/20 border-[#26ADE4]/40 text-[#26ADE4]";
      case "Contractor":
        return "bg-slate-700/80 border-slate-600 text-slate-200";
      case "Client":
        return "bg-slate-700/60 border-slate-600 text-slate-300";
      default:
        return "bg-slate-700/80 border-slate-600 text-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <Link
            href="/tickets"
            className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-[#26ADE4]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Tickets
          </Link>

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
              <div className="mt-2 flex items-center gap-3">
                <StatusBadge status={ticket.status} />
                <span className="text-slate-400">Assigned to</span>
                <span className="font-medium text-slate-200">{ticket.assignedTo}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Main Panel: Chat / Timeline */}
            <div className="min-w-0 flex-1">
              <div className="rounded-xl border border-slate-700/80 bg-slate-900">
                <div className="border-b border-slate-700/80 px-6 py-4">
                  <h2 className="font-semibold text-white">Timeline</h2>
                </div>
                <div className="flex max-h-[480px] flex-col overflow-hidden">
                  <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {ticket.timeline.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex max-w-[85%] flex-col gap-1 rounded-lg border px-4 py-3 ${
                          msg.sender === "Data Ladle" ? "ml-auto" : ""
                        } ${getMessageStyles(msg.sender)}`}
                      >
                        <span className="text-xs font-medium opacity-80">
                          {msg.sender}
                        </span>
                        <p className="text-sm">{msg.text}</p>
                        <span className="text-xs opacity-70">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-700/80 p-4">
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

            {/* Context Panel: Live Sensor Data */}
            <div className="w-full shrink-0 lg:w-80">
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-5">
                <h3 className="mb-4 font-semibold text-white">Sensor Context</h3>
                {sensor ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500">{sensor.name}</p>
                      <p className="text-sm text-slate-400">{sensor.location}</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700">
                        <Thermometer className="h-5 w-5 text-[#26ADE4]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Current Temp</p>
                        <p className="text-xl font-bold text-white">
                          {sensor.lastReading}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-800/50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700">
                        <Battery className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Battery</p>
                        <p className="text-xl font-bold text-white">
                          {sensor.batteryPercent}%
                        </p>
                      </div>
                    </div>
                    {building && (
                      <div className="pt-2 border-t border-slate-700/80">
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="text-sm text-slate-300">
                          {building.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {building.address}, {building.city}, {building.state}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Sensor not found.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
