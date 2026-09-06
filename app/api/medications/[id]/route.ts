import { NextRequest, NextResponse } from "next/server";
import { medicationFormSchema } from "@/lib/schemas/medication";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import type { IMedication, IResponse } from "@/interfaces/interfaces";

// GET /api/medications/[id] — a single MOPH catalog entry.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const medication = await prisma.medicationCatalogEntry.findUnique({
    where: { id },
  });

  if (!medication) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(medication);
}

// --- PATCH/DELETE below are unrelated to the catalog GET above ---
// medicationFormSchema (name/dosage/frequency/times/startDate/notes) matches
// the `Medication` model — a user's own regimen entry — not the read-only,
// MOPH-scraped `MedicationCatalogEntry` this file's GET queries. Now wired
// for real (the medication card menu's Edit/Delete/Set Reminder actions),
// brought onto the same IResponse convention as POST /api/medications and
// PATCH /api/schedule/doses/[id] (HTTP 200 always, real outcome in
// body.status) rather than this file's GET, which predates that convention.
//
// Set Reminder has no dedicated endpoint/model of its own — there's no
// Reminder table in the schema, and the modal only ever changes a
// medication's `times`. It reuses this same PATCH with the medication's
// existing fields plus new times, exactly like a normal edit.

async function loadOwnedMedication(id: string, userId: string) {
  const medication = await prisma.medication.findUnique({ where: { id } });
  if (!medication || medication.userId !== userId) return null;
  return medication;
}

function toIMedication(medication: {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  times: string[];
  startDate: Date;
  endDate: Date | null;
  notes: string | null;
}): IMedication {
  return {
    id: medication.id,
    name: medication.name,
    dose: medication.dose,
    frequency: medication.frequency as IMedication["frequency"],
    times: medication.times,
    startDate: medication.startDate.toISOString().slice(0, 10),
    endDate: medication.endDate ? medication.endDate.toISOString().slice(0, 10) : null,
    notes: medication.notes,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = medicationFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  // A medication belonging to another user 404s, same as one that doesn't
  // exist, rather than leaking whether the id is valid.
  const existing = await loadOwnedMedication(id, sessionUser.id);
  if (!existing) {
    return NextResponse.json({ status: 404, message: "Not found" } satisfies IResponse<never>, { status: 200 });
  }

  const { medicationName, dosage, frequency, times, startDate, endDate, notes } = parsed.data;

  const updated = await prisma.medication.update({
    where: { id },
    data: {
      name: medicationName,
      dose: dosage,
      frequency,
      times,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json(
    { status: 200, data: toIMedication(updated) } satisfies IResponse<IMedication>,
    { status: 200 }
  );
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const { id } = await params;

  const existing = await loadOwnedMedication(id, sessionUser.id);
  if (!existing) {
    return NextResponse.json({ status: 404, message: "Not found" } satisfies IResponse<never>, { status: 200 });
  }

  // Deleting a Medication cascades to its Dose rows (see schema.prisma) —
  // nothing else to clean up here.
  await prisma.medication.delete({ where: { id } });

  return NextResponse.json(
    { status: 200, data: { id } } satisfies IResponse<{ id: string }>,
    { status: 200 }
  );
}
