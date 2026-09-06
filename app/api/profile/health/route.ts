import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { healthProfileSchema } from "@/lib/schemas/profile";
import { prisma } from "@/lib/prisma";
import type { IHealthProfile, IResponse } from "@/interfaces/interfaces";

// PUT /api/profile/health
// Body: { weightKg?, heightCm?, bloodType?, allergies?, chronicConditions?,
//         emergencyContactName?, emergencyContactPhone? }
export async function PUT(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const body = await req.json();
  const parsed = healthProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const [healthProfile, medications] = await Promise.all([
    prisma.healthProfile.upsert({
      where: { userId: sessionUser.id },
      create: { userId: sessionUser.id, ...parsed.data },
      update: parsed.data,
    }),
    prisma.medication.findMany({
      where: { userId: sessionUser.id },
      select: { id: true, name: true, dose: true },
    }),
  ]);

  const data: IHealthProfile = {
    weightKg: healthProfile.weightKg,
    heightCm: healthProfile.heightCm,
    bloodType: healthProfile.bloodType,
    allergies: healthProfile.allergies,
    chronicConditions: healthProfile.chronicConditions,
    emergencyContactName: healthProfile.emergencyContactName,
    emergencyContactPhone: healthProfile.emergencyContactPhone,
    currentMedications: medications,
  };
  return NextResponse.json({ status: 200, data } satisfies IResponse<IHealthProfile>, { status: 200 });
}
