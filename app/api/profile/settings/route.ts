import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { settingsSchema } from "@/lib/schemas/profile";
import { prisma } from "@/lib/prisma";
import type { IResponse, IUserSettings } from "@/interfaces/interfaces";

// PUT /api/profile/settings
// Body: { doseReminders?, stockAlerts?, pharmacyUpdates?, locale? }
export async function PUT(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId: sessionUser.id },
    create: { userId: sessionUser.id, ...parsed.data },
    update: parsed.data,
  });

  const data: IUserSettings = {
    doseReminders: settings.doseReminders,
    stockAlerts: settings.stockAlerts,
    pharmacyUpdates: settings.pharmacyUpdates,
    locale: settings.locale as "en" | "ar",
  };
  return NextResponse.json({ status: 200, data } satisfies IResponse<IUserSettings>, { status: 200 });
}
