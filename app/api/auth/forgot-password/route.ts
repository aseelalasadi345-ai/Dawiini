import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordRequestSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IResponse } from "@/interfaces/interfaces";

// POST /api/auth/forgot-password — Body: { email, locale }
//
// Uses Supabase Auth's own built-in resetPasswordForEmail rather than a
// custom token/email system built from scratch — Supabase already handles
// secure token generation, single-use enforcement, and expiry; reinventing
// that here would just be a worse, riskier version of what it already does.
// The reset email itself is sent by Supabase (whichever SMTP is configured
// in the Supabase project's own Auth settings) — this is NOT the app's
// Gmail SMTP setup in lib/email/, which only sends the separate "welcome"
// email and is untouched by this route.
//
// Always returns success, whether or not the email is registered — matches
// auth.forgotPassword.successMessage's existing copy ("If an account exists
// with this email…"), which already committed the UI to this behavior.
// Revealing which emails exist would let a caller enumerate registered
// users. Supabase's own resetPasswordForEmail already returns success
// regardless internally, so this mostly just means "don't add a branch that
// would undo that" rather than actively suppressing a real error.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = forgotPasswordRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const { email, locale } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const redirectTo = `${req.nextUrl.origin}/api/auth/confirm?next=${encodeURIComponent(`/${locale}/reset-password`)}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  // Logged but not surfaced to the caller — see the comment above on why the
  // response stays generic regardless of outcome. A real failure here
  // (rate limit, SMTP misconfigured in the Supabase dashboard) is still
  // worth knowing about server-side.
  if (error) {
    console.error("Password reset request failed:", error.message);
  }

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
