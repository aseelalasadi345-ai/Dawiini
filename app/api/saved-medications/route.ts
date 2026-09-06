import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import type { ISavedMedication, IResponse } from "@/interfaces/interfaces";

// GET /api/saved-medications — the Saved tab's data source: the current
// user's saved MedicationCatalogEntry rows (real MOPH catalog, not the old
// mock catalog — see prisma/schema.prisma's SavedMedication comment).
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const rows = await prisma.savedMedication.findMany({
    where: { userId: sessionUser.id },
    include: { catalogEntry: true },
    orderBy: { createdAt: "desc" },
  });

  const data: ISavedMedication[] = rows.map((r) => ({
    catalogEntryId: r.catalogEntryId,
    name: r.catalogEntry.name,
    nameAr: r.catalogEntry.nameAr,
    form: r.catalogEntry.form,
    strength: r.catalogEntry.strength,
    genericName: r.catalogEntry.genericName,
    brand: r.catalogEntry.brand,
    useCase: r.catalogEntry.useCase,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ status: 200, data } satisfies IResponse<ISavedMedication[]>, { status: 200 });
}

// POST /api/saved-medications — body: { catalogEntryId }
// Idempotent: saving an already-saved entry is a no-op success, not an
// error, so the heart button on the detail page never needs to know
// whether it's the first save or a retry.
export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const body = await req.json().catch(() => null);
  const catalogEntryId = typeof body?.catalogEntryId === "string" ? body.catalogEntryId : null;
  if (!catalogEntryId) {
    return NextResponse.json({ status: 400, message: "catalogEntryId is required" } satisfies IResponse<never>, { status: 200 });
  }

  const catalogEntry = await prisma.medicationCatalogEntry.findUnique({ where: { id: catalogEntryId } });
  if (!catalogEntry) {
    return NextResponse.json({ status: 404, message: "Medication not found" } satisfies IResponse<never>, { status: 200 });
  }

  await prisma.savedMedication.upsert({
    where: { userId_catalogEntryId: { userId: sessionUser.id, catalogEntryId } },
    update: {},
    create: { userId: sessionUser.id, catalogEntryId },
  });

  return NextResponse.json({ status: 200 } satisfies IResponse<never>, { status: 200 });
}
