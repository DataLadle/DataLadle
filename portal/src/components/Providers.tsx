"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ImpersonationProvider } from "@/context/ImpersonationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ImpersonationProvider>{children}</ImpersonationProvider>
    </AuthProvider>
  );
}
