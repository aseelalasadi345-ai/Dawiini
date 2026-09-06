import { NextRequest, NextResponse } from "next/server";
import { updateDoseStatusSchema } from "@/lib/schemas/dose";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { createDoseTakenNotification, checkRefillNeeded } from "@/lib/notifications";
import type { IDose, IResponse } from "@/interfaces/interfaces";

// PATCH /api/schedule/doses/[id]
// Body: { status: "taken" | "skipped" | "pending" }
//
// This route never took a userId at all before (it trusted `id` alone) —
// so there's no placeholder to swap out, but it also had no ownership check
// whatsoever. Added one now that auth exists: a dose belonging to another
// user's medication 404s, same as a dose that doesn't exist, rather than
// leaking whether the id is valid.
//
// Brought onto the IResponse convention (HTTP 200 always, real outcome in
// body.status) — see app/api/schedule/today/route.ts's comment; the
// lib/api/schedule.ts wrapper for this route no longer needs to adapt
// around a bare-body/real-status-code response either.
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
  const parsed = updateDoseStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const existing = await prisma.dose.findUnique({
    where: { id },
    include: { medication: true },
  });
  if (!existing || existing.medication.userId !== sessionUser.id) {
    return NextResponse.json({ status: 404, message: "Not found" } satisfies IResponse<never>, { status: 200 });
  }

  const { status } = parsed.data;
  const updated = await prisma.dose.update({
    where: { id },
    data: {
      status,
      // Set on marking taken; cleared on any other status (including
      // moving straight back to "pending").
      takenAt: status === "taken" ? new Date() : null,
    },
  });

  // Only on a genuine transition into "taken" — not a no-op re-PATCH of an
  // already-taken dose — so retries/duplicate requests don't double-notify
  // or double-count toward the refill check below.
  if (status === "taken" && existing.status !== "taken") {
    await createDoseTakenNotification(sessionUser.id, existing.medication, updated);
    await checkRefillNeeded(existing.medication);
  }

  const data: IDose = {
    id: updated.id,
    medicationId: updated.medicationId,
    date: updated.date.toISOString(),
    time: updated.time,
    status: updated.status,
    takenAt: updated.takenAt ? updated.takenAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
  };
  return NextResponse.json({ status: 200, data } satisfies IResponse<IDose>, { status: 200 });
}
