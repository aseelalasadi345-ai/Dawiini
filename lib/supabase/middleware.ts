import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Refreshes the Supabase auth session (if any) on every request and writes
// the refreshed cookies onto `response` — mutates and returns the same
// response object it's given so this can run alongside next-intl's own
// middleware.NextResponse (redirect/rewrite/next) without discarding it.
//
// Per Supabase's guidance, this calls getUser() (not getSession()) so the
// token is actually revalidated against the Supabase Auth server, not just
// decoded from the cookie.
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
