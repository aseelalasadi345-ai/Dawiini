import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { IHealthProfile, IProfile, IResponse } from "@/interfaces/interfaces";

// GET /api/profile — personal + health + settings for the current session
// user. `personal` is never null (firstName/lastName/email are required at
// signup); `health`/`settings` are null until their own first PUT, except
// `health` still surfaces `currentMedications` (derived from the Medication
// table, see schema.prisma's HealthProfile comment) even before any
// HealthProfile row exists, since that data doesn't depend on it.
//
// Returns status: 404 only when nothing has been filled in at all yet
// (fresh signup: no PersonalProfile row, no HealthProfile row and no
// medications, no UserSettings row) — otherwise 200 with whichever
// sections exist and null for the rest.
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const [user, medications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { personalProfile: true, healthProfile: true, settings: true },
    }),
    prisma.medication.findMany({
      where: { userId: sessionUser.id },
      select: { id: true, name: true, dose: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ status: 404, message: "User not found" } satisfies IResponse<never>, { status: 200 });
  }

  const health: IHealthProfile | null =
    user.healthProfile || medications.length > 0
      ? {
          weightKg: user.healthProfile?.weightKg ?? null,
          heightCm: user.healthProfile?.heightCm ?? null,
          bloodType: user.healthProfile?.bloodType ?? null,
          allergies: user.healthProfile?.allergies ?? null,
          chronicConditions: user.healthProfile?.chronicConditions ?? null,
          emergencyContactName: user.healthProfile?.emergencyContactName ?? null,
          emergencyContactPhone: user.healthProfile?.emergencyContactPhone ?? null,
          currentMedications: medications,
        }
      : null;

  const settings = user.settings
    ? {
        doseReminders: user.settings.doseReminders,
        stockAlerts: user.settings.stockAlerts,
        pharmacyUpdates: user.settings.pharmacyUpdates,
        locale: user.settings.locale as "en" | "ar",
      }
    : null;

  const profile: IProfile = {
    personal: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfBirth: user.personalProfile?.dateOfBirth ?? null,
      phone: user.personalProfile?.phone ?? null,
    },
    health,
    settings,
  };

  const notFilledInAtAll = !user.personalProfile && !health && !settings;

  return NextResponse.json(
    {
      status: notFilledInAtAll ? 404 : 200,
      message: notFilledInAtAll ? "Profile not yet filled in" : undefined,
      data: profile,
    } satisfies IResponse<IProfile>,
    { status: 200 }
  );
}
