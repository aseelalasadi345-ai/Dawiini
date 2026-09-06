import { NextRequest, NextResponse } from "next/server";
import { IPharmacyAvailability, IResponse } from "@/interfaces/interfaces";
import { prisma } from "@/lib/prisma";

// GET /api/pharmacies/availability?medicationId=xxx
//
// `medicationId` refers to a MedicationCatalogEntry.id — matching the
// existing frontend convention (see the medication detail page's "Find
// Pharmacies" link: `/pharmacies?medicationId=${entry.id}`), even though the
// underlying FK on PharmacyMedicationAvailability is named `catalogEntryId`.
//
// Per the adopted API convention: every response is HTTP 200, with the real
// outcome embedded in the body's `status` field (see lib/axios.ts).
//
// Not called from any public page yet, and intentionally so: there's no
// real data feeding PharmacyMedicationAvailability (no admin UI writes it,
// by design — see its schema comment), only 9 seeded rows for local
// dev/testing. Wiring this into the UI before a real per-pharmacy inventory
// integration exists would show fabricated stock levels as if they were
// live. Leave this route as scaffolding until that integration lands.
export async function GET(req: NextRequest) {
  const medicationId = req.nextUrl.searchParams.get("medicationId");

  if (!medicationId) {
    const body: IResponse<undefined> = {
      status: 400,
      message: "medicationId is required",
    };
    return NextResponse.json(body, { status: 200 });
  }

  const availability = await prisma.pharmacyMedicationAvailability.findMany({
    where: { catalogEntryId: medicationId },
    include: { pharmacy: { include: { hours: true } } },
    orderBy: { pharmacy: { name: "asc" } },
  });

  if (availability.length === 0) {
    const body: IResponse<undefined> = {
      status: 404,
      message: "No pharmacies currently report stock for this medication",
    };
    return NextResponse.json(body, { status: 200 });
  }

  const data: IPharmacyAvailability[] = availability.map((entry) => ({
    pharmacyId: entry.pharmacyId,
    name: entry.pharmacy.name,
    address: entry.pharmacy.address,
    phone: entry.pharmacy.phone,
    hours: entry.pharmacy.hours.map((h) => ({ days: h.days, hours: h.hours })),
    level: entry.level,
    updatedAt: entry.updatedAt.toISOString(),
  }));

  const body: IResponse<IPharmacyAvailability[]> = {
    status: 200,
    data,
    message: "OK",
  };
  return NextResponse.json(body, { status: 200 });
}
