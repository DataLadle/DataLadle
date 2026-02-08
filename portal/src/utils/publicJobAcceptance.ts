/**
 * Client-side store for public magic-link job acceptances.
 * Persists to localStorage so contractors stay in "accepted" state on refresh.
 */

const STORAGE_KEY = "dataladle-public-job-acceptance";

export interface PublicJobAcceptance {
  technicianName: string;
  phone: string;
  completedAt?: string;
}

export function getPublicJobAcceptance(
  ticketId: string
): PublicJobAcceptance | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: Record<string, PublicJobAcceptance> = JSON.parse(raw);
    return data[ticketId] ?? null;
  } catch {
    return null;
  }
}

export function setPublicJobAcceptance(
  ticketId: string,
  acceptance: Partial<PublicJobAcceptance> & { technicianName: string; phone: string }
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, PublicJobAcceptance> = raw ? JSON.parse(raw) : {};
    data[ticketId] = { ...data[ticketId], ...acceptance } as PublicJobAcceptance;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function markPublicJobComplete(ticketId: string): void {
  const existing = getPublicJobAcceptance(ticketId);
  if (!existing) return;
  setPublicJobAcceptance(ticketId, {
    ...existing,
    completedAt: new Date().toISOString(),
  });
}
