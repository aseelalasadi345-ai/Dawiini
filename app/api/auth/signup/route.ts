import { NextRequest, NextResponse } from "next/server";
import { signupRequestSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import type { IResponse, ISignupResult } from "@/interfaces/interfaces";

// POST /api/auth/signup
// Body: { firstName, lastName, email, password }
//
// Creates the Supabase auth user first, then the matching Prisma `User`
// profile row keyed by the same UUID — done directly in this handler rather
// than via a Supabase Auth webhook/trigger. A webhook needs a publicly
// reachable endpoint configured through the Supabase project dashboard/CLI,
// which isn't available to set up here; doing it inline keeps signup working
// with only the two client-side env vars, at the cost of no atomicity
// between the two writes (see the catch block below).
//
// This route follows the IResponse convention (HTTP 200 always, real
// outcome in body.status) like every other new route this session.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const { firstName, lastName, email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return NextResponse.json(
      { status: error?.status ?? 400, message: error?.message ?? "Signup failed" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  // Supabase's anti-enumeration behavior: signUp() for an email that's
  // already registered AND confirmed doesn't return an error at all — it
  // returns a 200 with a user object whose `identities` array is empty.
  // Without this check, that would silently fall through to prisma.user
  // .create() below and fail on the email unique constraint with a generic
  // 500, instead of the real "this email is already registered" message.
  if (data.user.identities && data.user.identities.length === 0) {
    return NextResponse.json(
      { status: 409, message: "This email is already registered. Try logging in instead." } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  try {
    await prisma.user.create({
      data: { id: data.user.id, email, firstName, lastName },
    });
  } catch (err) {
    // The Supabase Auth user now exists without a matching Prisma row. Left
    // alone, this is a silent dead end: once Supabase considers the email
    // confirmed, every future signup attempt for it short-circuits at the
    // "already registered" check above without ever retrying the Prisma
    // insert — Supabase thinks the person is registered forever, and the
    // app's own User table never learns they exist. (This exact scenario
    // happened for real — see scripts/_find-orphaned-auth-users.mjs.)
    //
    // Fixed here by rolling back the just-created Supabase Auth account
    // instead of leaving it behind, so the two systems can't drift out of
    // sync: on failure, neither record survives, and signing up again with
    // the same email works normally. Rollback (not retry) because a blind
    // retry of the same insert would likely fail the same way for the same
    // reason; deleting and letting the person resubmit is simpler and more
    // predictable, and matches this app's general pattern of favoring
    // honest failure over silent partial state.
    console.error("Signup: Prisma user.create() failed after Supabase Auth account was created — rolling back.", {
      supabaseUserId: data.user.id,
      email,
      error: err,
    });

    const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    if (rollbackError) {
      // Rollback itself failed — this is now a genuine orphan requiring
      // manual cleanup (scripts/_find-orphaned-auth-users.mjs). Logged
      // loudly rather than swallowed, since there's no automatic recovery
      // left at this point.
      console.error("Signup: rollback of orphaned Supabase Auth account FAILED — manual cleanup required.", {
        supabaseUserId: data.user.id,
        email,
        rollbackError,
      });
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Something went wrong creating your account. Please try signing up again.",
      } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  // Welcome email — independent of the confirmation flow below (it's just
  // a "glad you're here" email, not a verification step). Awaited rather
  // than fire-and-forget so it isn't cut off if the platform ends this
  // invocation right after the response is sent, but sendWelcomeEmail
  // swallows its own errors, so a failed send never fails signup itself.
  await sendWelcomeEmail(email, firstName);

  // Whether signUp() returns a session depends on this Supabase project's
  // own "Confirm email" setting — checked here for real (data.session),
  // not hardcoded, so this route keeps working correctly whichever way
  // that setting is configured.
  const result: ISignupResult = {
    id: data.user.id,
    email,
    firstName,
    lastName,
    // A brand-new signup is always the schema's default role — no path to
    // becoming an admin at signup time, so this is a literal, not a lookup.
    role: "user",
    needsEmailConfirmation: !data.session,
  };
  return NextResponse.json({ status: 200, data: result } satisfies IResponse<ISignupResult>, { status: 200 });
}
