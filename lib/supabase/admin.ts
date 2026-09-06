import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client — bypasses RLS and can manage auth users
// directly (lookup by email, delete). Server-only: SUPABASE_SERVICE_ROLE_KEY
// must never reach the browser, so this file must never be imported from
// client code (nothing here is exported to a "use client" module today —
// keep it that way).
//
// Distinct from lib/supabase/server.ts, which uses the public anon key and
// reads/writes the session cookie for the signed-in user's own requests.
// This client has no session/cookies at all — it acts as the project itself,
// which is exactly what's needed to clean up a Supabase Auth user that
// doesn't have a valid session (e.g. an orphaned signup, see
// app/api/auth/signup/route.ts).
//
// Reused across hot-reloads the same way lib/prisma.ts reuses its client.
const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdmin: SupabaseClient | undefined;
};

function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export const supabaseAdmin = globalForSupabaseAdmin.supabaseAdmin ?? createAdminClient();

if (process.env.NODE_ENV !== "production") {
  globalForSupabaseAdmin.supabaseAdmin = supabaseAdmin;
}
