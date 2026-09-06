"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthProvider";
import type { IAuthUser } from "@/interfaces/interfaces";

// No QueryClientProvider existed anywhere in the app before this — required
// for any useQuery/useMutation hook (hooks/*) to work at all. useState's
// lazy initializer keeps the client stable across re-renders.
//
// `initialUser` is resolved server-side (app/[locale]/layout.tsx, from the
// Supabase session) and seeds AuthProvider so the current user is correct on
// first paint instead of flashing "signed out" until a client fetch resolves.
export default function Providers({
  initialUser,
  children,
}: {
  initialUser: IAuthUser | null;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
