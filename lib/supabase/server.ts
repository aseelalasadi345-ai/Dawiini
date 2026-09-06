import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Server-side Supabase client — for Server Components, Route Handlers, and
// Server Actions. Reads/writes the session cookie via next/headers' cookies().
//
// `cookies()` is only mutable inside Route Handlers and Server Actions; a
// plain Server Component's render can only read it. The try/catch below
// swallows the "called from a Server Component" error per Supabase's own
// guidance — middleware.ts is what actually keeps the session cookie
// refreshed for that case, so a failed write here is harmless.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — no-op, see comment above.
          }
        },
      },
    }
  );
}
