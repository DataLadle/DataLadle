"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { ContractorSidebar } from "@/components/ContractorSidebar";
import { useAssignment } from "@/context/AssignmentContext";
import {
  getLocationById,
  MOCK_TICKETS,
  USER_IDS,
  type Ticket,
  type TicketPriority,
} from "@/utils/mockData";

function useAvailableTickets() {
  const { getOverride } = useAssignment();
  return MOCK_TICKETS.filter((t) => {
    const override = getOverride(t.id);
    const effective = override !== undefined ? override : t.assignedToUserId;
    return effective == null || effective === "";
  });
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles = {
    Low: "bg-slate-500/20 text-slate-400",
    High: "bg-amber-500/20 text-amber-400",
    Critical: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}

function AvailableJobCard({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const { assign } = useAssignment();
  const location = getLocationById(ticket.locationId);
  const mapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${location.address}, ${location.city}, ${location.state}`
      )}`
    : "#";

  const handleClaim = () => {
    assign(ticket.id, USER_IDS.JOE_THE_TECH);
    router.push("/contractor");
  };

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2">
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h3 className="font-semibold text-white line-clamp-1">{ticket.title}</h3>
          {location && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#26ADE4]"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{location.name} · {location.address}</span>
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={handleClaim}
          className="shrink-0 rounded-lg bg-[#26ADE4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#26ADE4]/90"
        >
          Claim Job
        </button>
      </div>
    </div>
  );
}

export default function AvailableWorkPage() {
  const available = useAvailableTickets();

  return (
    <div className="min-h-screen bg-slate-950">
      <ContractorSidebar />
      <main className="pb-24 pl-0 pt-16 md:pl-24 md:pb-8 md:pt-8 lg:pl-56">
        <div className="px-4 md:px-8">
          <h1 className="text-2xl font-bold text-white">Available Work</h1>
          <p className="mt-1 text-slate-400">Unassigned jobs you can claim</p>

          <div className="mt-6 space-y-4">
            {available.length === 0 ? (
              <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-8 text-center">
                <p className="text-slate-500">No available work at the moment.</p>
              </div>
            ) : (
              available.map((ticket) => (
                <AvailableJobCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
