import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { personalProfileSchema } from "@/lib/schemas/profile";
import { prisma } from "@/lib/prisma";
import type { IPersonalProfile, IResponse } from "@/interfaces/interfaces";

// PUT /api/profile/personal — Body: { dateOfBirth?, phone? }
// firstName/lastName/email are core User identity fields (set at signup,
// email owned by Supabase Auth) and aren't editable through this route —
// out of scope for this task, which only asked for the fillable-later
// section fields.
export async function PUT(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const body = await req.json();
  const parsed = personalProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const [user, personalProfile] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } }),
    prisma.personalProfile.upsert({
      where: { userId: sessionUser.id },
      create: { userId: sessionUser.id, ...parsed.data },
      update: parsed.data,
    }),
  ]);

  const data: IPersonalProfile = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    dateOfBirth: personalProfile.dateOfBirth,
    phone: personalProfile.phone,
  };
  return NextResponse.json({ status: 200, data } satisfies IResponse<IPersonalProfile>, { status: 200 });
}
