import { NextRequest, NextResponse } from "next/server";
import { resetPasswordRequestSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IResponse } from "@/interfaces/interfaces";

// POST /api/auth/reset-password — Body: { password }
//
// No token in the body: the recovery session app/api/auth/confirm already
// established via cookies (by exchanging the emailed code) is what proves
// this request is legitimate — there's nothing else to check it against.
// If there's no valid session here, the link was never followed, was
// already used, or expired; reported as the same "invalid or expired" case
// the confirm route's own redirect produces, so the UI only needs one state
// for it either way.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = resetPasswordRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        status: 401,
        message: "This reset link is invalid or has expired. Please request a new one.",
      } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    // Supabase rejects re-submitting the current password with its own
    // dedicated code (verified live) rather than a generic failure — worth
    // its own status so the UI can show a real, specific field error
    // instead of silently doing nothing (which is what happened before this
    // check existed: the request failed, but nothing told the person why).
    if (error.code === "same_password") {
      return NextResponse.json(
        { status: 409, message: "New password must be different from your current password." } satisfies IResponse<never>,
        { status: 200 }
      );
    }
    return NextResponse.json(
      { status: 400, message: error.message } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  // Sign out of the recovery session so the person logs back in fresh with
  // their new password, rather than silently staying signed in from a
  // session that started as an emailed-link click.
  await supabase.auth.signOut();

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
