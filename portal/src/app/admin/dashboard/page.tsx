"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getClientsWithStats,
  getGlobalSensorHealth,
  getCriticalIncidents,
  getActiveContractors,
  getGlobalTickets,
  getClientById,
  getLocationById,
  getRuleById,
  MOCK_TICKETS,
  type TicketDispatchStatus,
} from "@/utils/mockData";
import { useImpersonation } from "@/context/ImpersonationContext";
import { getEscalatedTicketIds } from "@/utils/ticketEscalation";

function formatTimeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { setImpersonate } = useImpersonation();

  const clients = getClientsWithStats();
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const { total, healthy, percent } = getGlobalSensorHealth();
  const criticalIncidents = getCriticalIncidents();
  const activeContractors = getActiveContractors();
  const escalatedIds = getEscalatedTicketIds();
  const escalatedTickets = MOCK_TICKETS.filter((t) => escalatedIds.includes(t.id));

  const handleImpersonate = (clientId: string) => {
    setImpersonate(clientId);
    router.push("/");
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">NOC Dashboard</h1>
        <p className="mt-1 text-slate-400">
          High-level view of all client organizations
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-violet-800/60 bg-slate-900/80 p-6">
          <p className="text-sm font-medium text-slate-400">Total Active Clients</p>
          <p className="mt-3 text-3xl font-bold text-violet-400">{activeClients}</p>
          <p className="text-sm text-slate-500">of {clients.length} total</p>
        </div>
        <div className="rounded-xl border border-violet-800/60 bg-slate-900/80 p-6">
          <p className="text-sm font-medium text-slate-400">Global Sensor Health</p>
          <p className="mt-3 text-3xl font-bold text-violet-400">{percent}%</p>
          <p className="text-sm text-slate-500">
            {healthy} of {total} sensors online
          </p>
        </div>
        <div className="rounded-xl border border-violet-800/60 bg-slate-900/80 p-6">
          <p className="text-sm font-medium text-slate-400">Critical Incidents</p>
          <p className="mt-3 text-3xl font-bold text-red-400">
            {criticalIncidents.length}
          </p>
          <p className="text-sm text-slate-500">Red alerts across platform</p>
        </div>
        <div className="rounded-xl border border-violet-800/60 bg-slate-900/80 p-6">
          <p className="text-sm font-medium text-slate-400">Active Contractors</p>
          <p className="mt-3 text-3xl font-bold text-violet-400">
            {activeContractors.length}
          </p>
          <p className="text-sm text-slate-500">Currently on-site</p>
        </div>
      </div>

      {/* Escalated Tickets - Priority */}
      {escalatedTickets.length > 0 && (
        <div className="mb-8 rounded-xl border-2 border-amber-500/40 bg-amber-950/30 p-6">
          <h2 className="mb-4 font-semibold text-amber-400">Escalated Tickets</h2>
          <p className="mb-4 text-sm text-slate-500">
            Client requested help — review these first
          </p>
          <ul className="space-y-2">
            {escalatedTickets.map((ticket) => {
              const location = getLocationById(ticket.locationId);
              const client = location ? getClientById(location.clientId) : null;
              return (
                <li key={ticket.id}>
                  <Link
                    href={`/maintenance/${ticket.id}`}
                    className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-slate-900/80 px-4 py-3 transition-colors hover:border-amber-500/50"
                  >
                    <span className="font-medium text-white">{ticket.title}</span>
                    <span className="text-sm text-slate-400">
                      {client?.name ?? "—"} · {location?.name ?? "—"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Management Table */}
        <div className="rounded-xl border border-violet-800/40 bg-slate-900/80">
          <div className="border-b border-slate-700/80 px-6 py-4">
            <h2 className="font-semibold text-white">Client Management</h2>
            <p className="text-sm text-slate-500">Tenants and accounts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/80">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Client Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sensors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active Tickets
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-800/80 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {client.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          client.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {client.sensorCount}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {client.activeTickets}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleImpersonate(client.id)}
                        className="rounded-lg bg-violet-500/20 px-3 py-1.5 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-500/30"
                      >
                        Impersonate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Incidents + Active Contractors */}
        <div className="space-y-6">
          <div className="rounded-xl border border-violet-800/40 bg-slate-900/80 p-6">
            <h2 className="mb-4 font-semibold text-white">Critical Incidents</h2>
            {criticalIncidents.length > 0 ? (
              <ul className="space-y-2">
                {criticalIncidents.map((alert) => {
                  const rule = getRuleById(alert.ruleId);
                  return (
                    <li
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-red-400">
                        {rule?.name ?? alert.type}: {alert.value}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No critical incidents</p>
            )}
          </div>

          <div className="rounded-xl border border-violet-800/40 bg-slate-900/80 p-6">
            <h2 className="mb-4 font-semibold text-white">Active Contractors</h2>
            {activeContractors.length > 0 ? (
              <ul className="space-y-2">
                {activeContractors.map(({ user, locationName, ticketId }) => (
                  <li
                    key={ticketId}
                    className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">
                        On-site at {locationName}
                      </p>
                    </div>
                    <Link
                      href={`/maintenance/${ticketId}`}
                      className="text-sm text-violet-400 hover:underline"
                    >
                      View ticket →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No contractors on-site</p>
            )}
          </div>
        </div>
      </div>

      {/* Global Ticket Feed */}
      <div className="mt-8 rounded-xl border border-violet-800/40 bg-slate-900/80">
        <GlobalTicketFeed />
      </div>
    </main>
  );
}

function GlobalTicketFeed() {
  const [filter, setFilter] = useState<TicketDispatchStatus | "all">("all");

  const tickets =
    filter === "all"
      ? getGlobalTickets()
      : getGlobalTickets(filter as TicketDispatchStatus);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 px-6 py-4">
        <h2 className="font-semibold text-white">Global Ticket Feed</h2>
        <div className="flex gap-2">
          {(["all", "Unassigned", "Dispatched", "Monitoring"] as const).map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-violet-500/20 text-violet-400"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            )
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/80">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Dispatch
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assigned To
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => {
              const location = getLocationById(ticket.locationId);
              const client = location ? getClientById(location.clientId) : null;
              return (
                <tr
                  key={ticket.id}
                  className="border-b border-slate-800/80 last:border-0"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/maintenance/${ticket.id}`}
                      className="font-medium text-violet-400 hover:underline"
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {client?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{ticket.status}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        (ticket.ticketDispatchStatus ?? "Unassigned") ===
                        "Unassigned"
                          ? "bg-amber-500/20 text-amber-400"
                          : (ticket.ticketDispatchStatus ?? "") === "Dispatched"
                            ? "bg-[#26ADE4]/20 text-[#26ADE4]"
                            : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {ticket.ticketDispatchStatus ?? "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {ticket.assignedTo ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {tickets.length === 0 && (
        <p className="p-6 text-center text-slate-500">No tickets match filter</p>
      )}
    </>
  );
}
