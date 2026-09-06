import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { logAsNeededDoseSchema } from "@/lib/schemas/dose";
import { prisma } from "@/lib/prisma";
import { toLocalDateString, toLocalTimeString } from "@/lib/date";
import { getSessionUser } from "@/lib/auth/session";
import { createDoseTakenNotification } from "@/lib/notifications";

// POST /api/schedule/doses/log-as-needed
// Body: { medicationId, takenAt? }
//
// For "as_needed" medications, which have no fixed `times` to lazily
// generate Dose rows from (see GET /api/schedule/today) — this is the only
// way an as_needed medication gets a Dose row at all: the user explicitly
// logs having taken one.
export async function POST(req: NextRequest) {
  // This route had no session/ownership check at all before this task
  // (unlike PATCH .../doses/[id], which was already fixed) — noticed while
  // wiring in dose-taken notifications, which need a real userId anyway.
  // Added here for the same reason: without it, any caller could log a
  // dose (and now, a notification) against any other user's medication.
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = logAsNeededDoseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid data", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { medicationId } = parsed.data;
  const takenAt = parsed.data.takenAt ? new Date(parsed.data.takenAt) : new Date();

  // The Dose's `date`/`time` are the actual clock time of takenAt (or now),
  // in server-local time — same convention as GET .../today.
  const dateStr = toLocalDateString(takenAt);
  const time = toLocalTimeString(takenAt);
  const date = new Date(dateStr);

  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
  });

  const isActiveOnDate = (m: NonNullable<typeof medication>) =>
    m.startDate <= date && (!m.endDate || m.endDate >= date);

  // Not found, not owned by the caller, not as_needed, or not active on
  // that date are all treated as "this medication can't be logged this
  // way" — 404, not a 400/403, since medicationId itself is well-formed.
  if (
    !medication ||
    medication.userId !== sessionUser.id ||
    medication.frequency !== "as_needed" ||
    !isActiveOnDate(medication)
  ) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    const dose = await prisma.dose.create({
      data: {
        medicationId,
        date,
        time,
        status: "taken",
        takenAt,
      },
    });

    await createDoseTakenNotification(sessionUser.id, medication, dose);

    return NextResponse.json(dose, { status: 201 });
  } catch (err) {
    // Unique constraint on [medicationId, date, time] — two logs landing in
    // the same minute for the same medication on the same day.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "A dose was already logged for this medication at this exact minute" },
        { status: 409 }
      );
    }
    throw err;
  }
}
