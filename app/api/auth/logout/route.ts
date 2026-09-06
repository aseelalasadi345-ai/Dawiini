import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IResponse } from "@/interfaces/interfaces";

// POST /api/auth/logout — signs out via Supabase, which clears the session
// cookies through the server client's setAll on this response.
export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
