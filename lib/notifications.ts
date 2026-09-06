import { prisma } from "@/lib/prisma";
import { REQUIRED_TIME_COUNT } from "@/lib/schemas/medication";
import { toLocalDateString, toLocalTimeString } from "@/lib/date";
import type { Medication, Dose } from "@/app/generated/prisma/client";

// A course's last few doses trigger one refill_needed notification — see
// checkRefillNeeded below. Not a stored "quantity" field: this is computed
// purely from the medication's own schedule (startDate/endDate/frequency)
// and how many of its doses have actually been logged taken, per the
// product decision to derive this mathematically rather than add manual
// stock tracking.
const LOW_DOSE_THRESHOLD = 3;

// Called whenever a dose is marked taken (app/api/schedule/doses/[id]).
// title/message are plain rendered text — see prisma/schema.prisma's
// Notification comment for why.
export async function createDoseTakenNotification(
  userId: string,
  medication: Pick<Medication, "id" | "name" | "dose">,
  dose: Pick<Dose, "id" | "time">,
) {
  await prisma.notification.upsert({
    where: { doseId_type: { doseId: dose.id, type: "dose_taken" } },
    update: {},
    create: {
      userId,
      type: "dose_taken",
      title: "Dose taken",
      message: `You marked ${medication.name} ${medication.dose} as taken at ${dose.time}.`,
      medicationId: medication.id,
      doseId: dose.id,
    },
  });
}

// Fires once when a medication's remaining doses (computed, not stored —
// see LOW_DOSE_THRESHOLD above) cross into the low zone. Only meaningful for
// medications with a real start AND end date and a fixed per-day dose count
// — "as_needed" medications have neither fixed times nor a real "course
// length" to divide by, so they're skipped entirely (same exclusion GET
// /api/schedule/today already applies for the same reason).
export async function checkRefillNeeded(
  medication: Pick<
    Medication,
    "id" | "userId" | "name" | "dose" | "frequency" | "times" | "startDate" | "endDate"
  >,
) {
  if (medication.frequency === "as_needed" || !medication.endDate) return;

  const dosesPerDay = medication.times.length || REQUIRED_TIME_COUNT[medication.frequency];
  if (dosesPerDay <= 0) return;

  const totalDays =
    Math.round(
      (medication.endDate.getTime() - medication.startDate.getTime()) / 86_400_000,
    ) + 1;
  if (totalDays <= 0) return;

  const totalDoses = totalDays * dosesPerDay;

  const takenCount = await prisma.dose.count({
    where: { medicationId: medication.id, status: "taken" },
  });

  const remaining = totalDoses - takenCount;
  if (remaining <= 0 || remaining > LOW_DOSE_THRESHOLD) return;

  // Avoid re-notifying every single dose while the course stays in the low
  // zone — only notify again once the user has actually seen (read) the
  // last one.
  const existingUnread = await prisma.notification.findFirst({
    where: { medicationId: medication.id, type: "refill_needed", read: false },
    select: { id: true },
  });
  if (existingUnread) return;

  await prisma.notification.create({
    data: {
      userId: medication.userId,
      type: "refill_needed",
      title: "Refill needed",
      message: `You have about ${remaining} dose${remaining === 1 ? "" : "s"} of ${medication.name} ${medication.dose} left in this course.`,
      medicationId: medication.id,
    },
  });
}

// The lazy, on-read equivalent of GET /api/schedule/today's Dose
// generation: there's no cron/job runner anywhere in this project, so
// rather than invent one, a due-dose check runs here, inside
// GET /api/notifications — a route that's called on essentially every page
// (the navbar badge fetches it). This means a reminder appears the next
// time the user has the app open past the due time, not the instant it's
// due; real push timing would need a real scheduler, which is out of scope
// here. Deduped via Notification's @@unique([doseId, type]) — safe to call
// on every request.
export async function checkDueDoseReminders(userId: string) {
  const now = new Date();
  const dateStr = toLocalDateString(now);
  const date = new Date(dateStr);
  const nowTime = toLocalTimeString(now);

  const dueDoses = await prisma.dose.findMany({
    where: {
      date,
      time: { lte: nowTime },
      status: "pending",
      medication: { userId },
    },
    include: { medication: true },
  });

  await Promise.all(
    dueDoses.map((dose) =>
      prisma.notification.upsert({
        where: { doseId_type: { doseId: dose.id, type: "dose_reminder" } },
        update: {},
        create: {
          userId,
          type: "dose_reminder",
          title: "Dose reminder",
          message: `Time to take ${dose.medication.name} ${dose.medication.dose}.`,
          medicationId: dose.medicationId,
          doseId: dose.id,
        },
      }),
    ),
  );
}
