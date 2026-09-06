import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import type { IMedication, IResponse } from "@/interfaces/interfaces";

// GET /api/medications/mine — the current session user's own regimen
// (Medication rows), for the "My Medications" list page. Split out under
// its own static segment rather than overloading GET /api/medications
// (which is a completely different resource — the shared MOPH catalog
// search) or GET /api/medications/[id] (a single catalog entry). Next.js
// resolves this static "mine" segment ahead of the "[id]" dynamic one, so
// both coexist without conflict.
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const medications = await prisma.medication.findMany({
    where: { userId: sessionUser.id },
    orderBy: { createdAt: "asc" },
  });

  const data: IMedication[] = medications.map((m) => ({
    id: m.id,
    name: m.name,
    dose: m.dose,
    frequency: m.frequency,
    times: m.times,
    startDate: m.startDate.toISOString().slice(0, 10),
    endDate: m.endDate ? m.endDate.toISOString().slice(0, 10) : null,
    notes: m.notes,
  }));

  return NextResponse.json({ status: 200, data } satisfies IResponse<IMedication[]>, { status: 200 });
}
