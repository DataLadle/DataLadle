"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { USER_IDS } from "@/utils/mockData";

const STORAGE_KEY = "dataladle-assignment-overrides";

type AssignmentOverrides = Record<string, string | null>;

function loadOverrides(): AssignmentOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveOverrides(overrides: AssignmentOverrides) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

type AssignmentContextValue = {
  assign: (ticketId: string, userId: string) => void;
  unassign: (ticketId: string) => void;
  getOverride: (ticketId: string) => string | null | undefined;
};

const AssignmentContext = createContext<AssignmentContextValue | null>(null);

export function AssignmentProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<AssignmentOverrides>(() => loadOverrides());

  useEffect(() => {
    saveOverrides(overrides);
  }, [overrides]);

  const assign = useCallback((ticketId: string, userId: string) => {
    setOverrides((prev) => ({ ...prev, [ticketId]: userId }));
  }, []);

  const unassign = useCallback((ticketId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[ticketId];
      return next;
    });
  }, []);

  const getOverride = useCallback(
    (ticketId: string) => overrides[ticketId],
    [overrides]
  );

  const value = useMemo(
    () => ({ assign, unassign, getOverride }),
    [assign, unassign, getOverride]
  );

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignment() {
  const ctx = useContext(AssignmentContext);
  if (!ctx) {
    throw new Error("useAssignment must be used within AssignmentProvider");
  }
  return ctx;
}
