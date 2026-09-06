import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayLocalDateString } from "@/lib/date";
import { getSessionUser } from "@/lib/auth/session";
import type { IDoseToday, IResponse } from "@/interfaces/interfaces";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/schedule/today?date=YYYY-MM-DD
//
// `userId` used to be trusted as-given from the query string (see git
// history) — now taken from the authenticated session instead, so a request
// with no valid session gets 401 and can no longer read another user's
// schedule by passing their id.
//
// Brought onto the IResponse convention (HTTP 200 always, real outcome in
// body.status) — this route used to return real HTTP status codes with a
// bare body, which lib/api/schedule.ts's getTodaySchedule() manually
// adapted around. Now that this route returns the shape natively, that
// wrapper calls the generic axiosGet directly instead (see lib/axios.ts).
export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }
  const userId = sessionUser.id;

  const dateParam = req.nextUrl.searchParams.get("date");
  const dateStr = dateParam ?? todayLocalDateString();
  if (!DATE_REGEX.test(dateStr) || Number.isNaN(Date.parse(dateStr))) {
    return NextResponse.json(
      { status: 400, message: "date must be a valid YYYY-MM-DD string" } satisfies IResponse<never>,
      { status: 200 }
    );
  }
  // A bare "YYYY-MM-DD" string is parsed as UTC midnight per the ES spec —
  // matches how Prisma stores @db.Date columns.
  const date = new Date(dateStr);

  const activeMedications = await prisma.medication.findMany({
    where: {
      userId,
      startDate: { lte: date },
      OR: [{ endDate: null }, { endDate: { gte: date } }],
    },
  });

  // Lazily generate today's Dose rows so nothing needs a cron job to
  // pre-populate them. The unique constraint + upsert makes this race-safe
  // if two requests hit this at once.
  //
  // "as_needed" medications have no fixed times (times: []) and are
  // deliberately excluded here — there's no schedule to generate placeholder
  // doses from. Their doses only come from POST .../doses/log-as-needed,
  // and still surface below since this loop's exclusion doesn't affect the
  // activeMedications list the doses query filters on.
  await Promise.all(
    activeMedications
      .filter((medication) => medication.frequency !== "as_needed")
      .flatMap((medication) =>
        medication.times.map((time) =>
          prisma.dose.upsert({
            where: {
              medicationId_date_time: {
                medicationId: medication.id,
                date,
                time,
              },
            },
            update: {},
            create: {
              medicationId: medication.id,
              date,
              time,
              status: "pending",
            },
          })
        )
      )
  );

  const doses = await prisma.dose.findMany({
    where: {
      medicationId: { in: activeMedications.map((m) => m.id) },
      date,
    },
    include: { medication: true },
    orderBy: { time: "asc" },
  });

  const data: IDoseToday[] = doses.map((dose) => ({
    doseId: dose.id,
    medicationId: dose.medicationId,
    medicationName: dose.medication.name,
    dose: dose.medication.dose,
    notes: dose.medication.notes,
    time: dose.time,
    status: dose.status,
    takenAt: dose.takenAt ? dose.takenAt.toISOString() : null,
  }));

  return NextResponse.json({ status: 200, data } satisfies IResponse<IDoseToday[]>, { status: 200 });
}
