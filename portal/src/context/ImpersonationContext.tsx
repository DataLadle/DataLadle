"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const IMPERSONATION_KEY = "dataladle-impersonate-client";

type ImpersonationContextValue = {
  impersonatedClientId: string | null;
  setImpersonate: (clientId: string | null) => void;
  exitImpersonation: () => void;
};

const ImpersonationContext = createContext<ImpersonationContextValue | null>(
  null
);

function loadStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(IMPERSONATION_KEY);
  } catch {
    return null;
  }
}

function saveStored(clientId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (clientId) {
      localStorage.setItem(IMPERSONATION_KEY, clientId);
    } else {
      localStorage.removeItem(IMPERSONATION_KEY);
    }
  } catch {
    // ignore
  }
}

export function ImpersonationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [impersonatedClientId, setState] = useState<string | null>(null);

  useEffect(() => {
    setState(loadStored());
  }, []);

  const setImpersonate = useCallback((clientId: string | null) => {
    setState(clientId);
    saveStored(clientId);
  }, []);

  const exitImpersonation = useCallback(() => {
    setState(null);
    saveStored(null);
  }, []);

  const value = useMemo(
    () => ({ impersonatedClientId, setImpersonate, exitImpersonation }),
    [impersonatedClientId, setImpersonate, exitImpersonation]
  );

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) {
    return {
      impersonatedClientId: null,
      setImpersonate: () => {},
      exitImpersonation: () => {},
    };
  }
  return ctx;
}
