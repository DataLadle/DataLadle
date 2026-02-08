/**
 * Client-side store for ticket escalation and client self-resolution.
 * Co-Managed model: client can Mark Resolved or Escalate to Support.
 */

const STORAGE_KEY = "dataladle-ticket-escalation";

export interface TicketEscalationState {
  escalatedAt?: string;
  resolvedByClient?: {
    note: string;
    resolvedAt: string;
  };
}

function loadAll(): Record<string, TicketEscalationState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, TicketEscalationState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function isTicketEscalated(ticketId: string): boolean {
  const data = loadAll();
  return Boolean(data[ticketId]?.escalatedAt);
}

export function isTicketResolvedByClient(ticketId: string): boolean {
  const data = loadAll();
  return Boolean(data[ticketId]?.resolvedByClient);
}

export function getTicketEscalationState(
  ticketId: string
): TicketEscalationState | null {
  const data = loadAll();
  return data[ticketId] ?? null;
}

export function escalateTicket(ticketId: string): void {
  const data = loadAll();
  data[ticketId] = {
    ...data[ticketId],
    escalatedAt: new Date().toISOString(),
  };
  saveAll(data);
}

export function resolveTicketByClient(
  ticketId: string,
  note: string
): void {
  const data = loadAll();
  data[ticketId] = {
    ...data[ticketId],
    resolvedByClient: {
      note,
      resolvedAt: new Date().toISOString(),
    },
    escalatedAt: undefined, // clear escalation if any
  };
  saveAll(data);
}

export function getEscalatedTicketIds(): string[] {
  const data = loadAll();
  return Object.entries(data)
    .filter(([, s]) => s.escalatedAt)
    .map(([id]) => id);
}

/** Effective status considering client escalation/resolution */
export function getEffectiveTicketStatus(
  ticketId: string,
  baseStatus: string
): string {
  const state = getTicketEscalationState(ticketId);
  if (state?.resolvedByClient) return "Resolved";
  if (state?.escalatedAt) return "Escalated";
  return baseStatus;
}
