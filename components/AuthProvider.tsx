"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { IAuthUser } from "@/interfaces/interfaces";

// Mirrors MedicationsProvider's context+Provider shape (the one existing
// precedent for app-level state in this codebase) — a plain React Context
// holding the current user, seeded from the server-rendered session (see
// app/[locale]/layout.tsx) so it's correct on first paint, then updated by
// useLogin/useSignup/useLogout's mutation hooks (hooks/useAuth.ts) on
// success.
interface AuthContextValue {
  user: IAuthUser | null;
  setUser: (user: IAuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: IAuthUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<IAuthUser | null>(initialUser);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
