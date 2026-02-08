"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUserById, USER_IDS, type User } from "@/utils/mockData";

const AUTH_KEY = "dataladle-current-user-id";

type AuthContextValue = {
  currentUser: User | null;
  setCurrentUserById: (userId: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_KEY);
  } catch {
    return null;
  }
}

function saveStoredUserId(userId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      localStorage.setItem(AUTH_KEY, userId);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(loadStoredUserId());
  }, []);

  const setCurrentUserById = useCallback((id: string | null) => {
    setUserId(id);
    saveStoredUserId(id);
  }, []);

  const currentUser = useMemo(
    () => (userId ? getUserById(userId) ?? null : null),
    [userId]
  );

  const value = useMemo(
    () => ({ currentUser, setCurrentUserById }),
    [currentUser, setCurrentUserById]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      currentUser: null,
      setCurrentUserById: () => {},
    };
  }
  return ctx;
}
