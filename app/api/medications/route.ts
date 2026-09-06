import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { medicationFormSchema } from "@/lib/schemas/medication";
import type { IMedication, IResponse } from "@/interfaces/interfaces";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Ingredient matching only kicks in past this length, matching the old
// client-side search's rule (lib/medicationSearch.ts) — otherwise a 1-2
// character query would match almost every row's ingredients list.
const MIN_INGREDIENT_QUERY_LENGTH = 3;

type CatalogWhere = NonNullable<Parameters<typeof prisma.medicationCatalogEntry.findMany>[0]>["where"];
type MatchSource = "name" | "ingredients";

// GET /api/medications?q=<search text>&limit=<n>
//
// The Search page's autocomplete (previously an in-browser search over the
// static data/medications.json bundle — see components/MedicationAutocomplete.tsx)
// and the medications list's "Find in Pharmacy" lookup both call this same
// real DB-backed route now.
//
// Ranked in tiers, closest match first — name/nameAr prefix, then
// name/nameAr substring, then (query length permitting) ingredient prefix,
// then ingredient substring — same tier order as the old client-side
// ranking, just run as up to 4 sequential queries against the real table
// instead of an in-memory sort. Each tier excludes ids already found by an
// earlier tier and only queries for however many more results are still
// needed to reach `limit`, so a query that's satisfied by name matches
// alone never touches the (unindexed, more expensive) ingredients tiers.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const limitParam = Number(req.nextUrl.searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_LIMIT)
      : DEFAULT_LIMIT;

  // No query -> no results, rather than an unbounded scan of ~6,000 rows.
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const seen = new Set<string>();
  const results: (Awaited<ReturnType<typeof prisma.medicationCatalogEntry.findMany>>[number] & {
    matchSource: MatchSource;
  })[] = [];

  async function addTier(where: CatalogWhere, matchSource: MatchSource) {
    const remaining = limit - results.length;
    if (remaining <= 0) return;

    const rows = await prisma.medicationCatalogEntry.findMany({
      where: { AND: [where!, { id: { notIn: [...seen] } }] },
      orderBy: { name: "asc" },
      take: remaining,
    });

    for (const row of rows) {
      seen.add(row.id);
      results.push({ ...row, matchSource });
    }
  }

  await addTier(
    { OR: [{ name: { startsWith: q, mode: "insensitive" } }, { nameAr: { startsWith: q, mode: "insensitive" } }] },
    "name",
  );
  await addTier(
    { OR: [{ name: { contains: q, mode: "insensitive" } }, { nameAr: { contains: q, mode: "insensitive" } }] },
    "name",
  );
  if (q.length >= MIN_INGREDIENT_QUERY_LENGTH) {
    await addTier({ ingredients: { startsWith: q, mode: "insensitive" } }, "ingredients");
    await addTier({ ingredients: { contains: q, mode: "insensitive" } }, "ingredients");
  }

  return NextResponse.json({ results });
}

// POST /api/medications — creates a `Medication` row (the current session
// user's own regimen entry) — a completely different resource from this
// file's GET above (the shared, read-only MOPH `MedicationCatalogEntry`
// catalog). They share this path because /api/medications/[id]'s GET
// (catalog-by-id) and PATCH/DELETE (personal-regimen stubs) already split
// the same way — matching that existing convention rather than inventing a
// new one.
//
// Body matches MedicationFormValues exactly (medicationName/dosage/...) —
// the same schema the client-side form already validates against, reused
// here rather than duplicated. Built to the IResponse convention (HTTP 200
// always, real outcome in body.status), unlike this file's GET, which
// predates that convention and is out of scope to retrofit here.
//
// Does NOT create any Dose rows — GET /api/schedule/today already lazily
// generates a medication's Dose rows the next time it's called (via
// upsert, keyed on [medicationId, date, time]), so doing it again here
// would just duplicate that logic. useCreateMedication's invalidation of
// ["todaySchedule"] (see hooks/useMedications.ts) is what triggers that
// next call.
export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ status: 401, message: "Not signed in" } satisfies IResponse<never>, { status: 200 });
  }

  const body = await req.json();
  const parsed = medicationFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: 400, message: parsed.error.issues[0]?.message ?? "Invalid data" } satisfies IResponse<never>,
      { status: 200 }
    );
  }

  const { medicationName, dosage, frequency, times, startDate, endDate, notes } = parsed.data;

  const medication = await prisma.medication.create({
    data: {
      userId: sessionUser.id,
      name: medicationName,
      dose: dosage,
      frequency,
      times,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || null,
    },
  });

  const data: IMedication = {
    id: medication.id,
    name: medication.name,
    dose: medication.dose,
    frequency: medication.frequency,
    times: medication.times,
    startDate: medication.startDate.toISOString().slice(0, 10),
    endDate: medication.endDate ? medication.endDate.toISOString().slice(0, 10) : null,
    notes: medication.notes,
  };
  return NextResponse.json({ status: 200, data } satisfies IResponse<IMedication>, { status: 200 });
}
