import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/auth/confirm — the redirectTo target for Supabase Auth email
// links. Currently only used by the password-recovery flow (see
// app/api/auth/forgot-password/route.ts), but written generically since
// this is the same "exchange the emailed code for a session" step any
// Supabase email link needs.
//
// Lives outside the [locale] segment (it's a plain Route Handler, not a
// page), so `next` carries the locale-aware destination the caller actually
// wants to land on — this route only knows how to turn `code` into a real
// session, not which page should render next.
//
// This must run server-side, via the cookie-writing server client, so the
// session cookie is set before the browser ever requests `next` — a
// client-side exchange wouldn't have anywhere to persist it in a way this
// app's server routes (which all read the session from cookies) could see.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/en/reset-password";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, req.nextUrl.origin));
    }
  }

  // Missing/invalid/already-used/expired code — land on the same page with
  // an error flag instead of a broken form, so there's a real "request a
  // new link" path instead of a dead end.
  const errorUrl = new URL(next, req.nextUrl.origin);
  errorUrl.searchParams.set("error", "invalid");
  return NextResponse.redirect(errorUrl);
}
