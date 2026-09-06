import { NextRequest, NextResponse } from "next/server";
import { loginRequestSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { IAuthUser, IResponse } from "@/interfaces/interfaces";

// POST /api/auth/login — Body: { email, password }
// Standard Supabase email/password sign-in; the server client's setAll
// writes the session cookies straight onto this response.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const { email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    // "Email not confirmed" is a genuinely different, actionable case from
    // wrong credentials — verified live (Supabase returns
    // code: "email_not_confirmed", not "invalid_credentials") — so it gets
    // its own status rather than being folded into the generic message
    // below, which would otherwise tell a user with the *correct* password
    // that their email or password was wrong.
    if (error?.code === "email_not_confirmed") {
      return NextResponse.json(
        { status: 403, message: "Please confirm your email before logging in." } satisfies IResponse<never>,
        { status: 200 }
      );
    }

    // Generic message regardless of whether the email exists, matching
    // LoginForm's existing single "loginFailed" message.
    return NextResponse.json(
      { status: 401, message: "Invalid email or password" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const profile = await prisma.user.findUnique({ where: { id: data.user.id } });
  if (!profile) {
    return NextResponse.json(
      { status: 404, message: "No profile found for this account" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const user: IAuthUser = {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
  };
  return NextResponse.json({ status: 200, data: user } satisfies IResponse<IAuthUser>, { status: 200 });
}
