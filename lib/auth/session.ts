import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Resolves the authenticated user for the current request, for use inside
// Route Handlers and Server Components — the server-side replacement for the
// old "trust a client-supplied userId" placeholder. Returns `null` rather
// than throwing so callers can decide their own 401 shape (IResponse for API
// routes, a redirect for pages).
//
// Uses getUser() (revalidates the JWT against Supabase Auth), not
// getSession() (only decodes the cookie) — see lib/supabase/middleware.ts.
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// The admin role (prisma/schema.prisma: User.role) lives in our own Prisma
// User table, not Supabase Auth — this project has no custom-claims/Auth
// Hook setup to stamp a role onto the Supabase JWT, so there's no token
// claim to read instead. This does one extra DB lookup by the session's
// user id rather than trusting anything client-supplied, matching every
// other route in this app (session identity from Supabase, everything else
// about the user from Prisma).
//
// Returns `user: null` when signed out and `role: null` when signed in but
// with no role recorded, so callers can tell "not signed in" (401) apart
// from "signed in, not an admin" (403) — see app/api/admin/pharmacies/route.ts.
export async function getSessionUserWithRole() {
  const user = await getSessionUser();
  if (!user) return { user: null, role: null };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  return { user, role: dbUser?.role ?? null };
}

// Convenience for pages/checks that only need the yes/no answer.
export async function isAdmin() {
  const { role } = await getSessionUserWithRole();
  return role === "admin";
}
