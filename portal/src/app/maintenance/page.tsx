"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useImpersonation } from "@/context/ImpersonationContext";
import {
  getTicketsForClient,
  getLocationById,
  type TicketStatus,
  type TicketPriority,
  CLIENT_IDS,
} from "@/utils/mockData";
import { getEffectiveTicketStatus } from "@/utils/ticketEscalation";

function useClientContext() {
  const { impersonatedClientId } = useImpersonation();
  return impersonatedClientId ?? CLIENT_IDS.ACME;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: TicketStatus | string }) {
  const styles: Record<string, string> = {
    Open: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    "In Progress": "bg-[#26ADE4]/20 text-[#26ADE4] border-[#26ADE4]/40",
    Resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    Escalated: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/40"}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles = {
    Low: "text-slate-400",
    High: "text-amber-400",
    Critical: "text-red-400 font-semibold",
  };
  return <span className={styles[priority]}>{priority}</span>;
}

export default function MaintenancePage() {
  const router = useRouter();
  const clientId = useClientContext();
  const tickets = getTicketsForClient(clientId);
  const [filter, setFilter] = useState<"open" | "resolved">("open");

  const ticketsWithEffectiveStatus = tickets.map((t) => ({
    ...t,
    effectiveStatus: getEffectiveTicketStatus(t.id, t.status),
  }));
  const filteredTickets =
    filter === "open"
      ? ticketsWithEffectiveStatus.filter((t) => t.effectiveStatus !== "Resolved")
      : ticketsWithEffectiveStatus.filter((t) => t.effectiveStatus === "Resolved");

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-56">
        <TopBar />
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Maintenance</h2>
            <p className="mt-1 text-slate-400">Work orders and support</p>
          </div>

          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("open")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === "open"
                  ? "bg-[#26ADE4]/20 text-[#26ADE4]"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => setFilter("resolved")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === "resolved"
                  ? "bg-[#26ADE4]/20 text-[#26ADE4]"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
              }`}
            >
              Resolved
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/80">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => router.push(`/maintenance/${ticket.id}`)}
                    className="cursor-pointer border-b border-slate-800/80 transition-colors hover:bg-slate-800/30 last:border-0"
                  >
                    <td className="px-6 py-4"><StatusBadge status={ticket.effectiveStatus} /></td>
                    <td className="px-6 py-4"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-6 py-4 font-medium text-white">{ticket.title}</td>
                    <td className="px-6 py-4 text-slate-400">{getLocationById(ticket.locationId)?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(ticket.lastUpdated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <p className="mt-6 text-center text-slate-500">No {filter} work orders.</p>
          )}
        </main>
      </div>
    </div>
  );
}
