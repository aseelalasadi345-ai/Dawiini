import { prisma } from "@/lib/prisma";

// Resolves a MedicationCatalogEntry by its display identity (name, form,
// strength) rather than its real id. Used by
// app/[locale]/(home)/(my-medication)/medications/moph/[index]/page.tsx —
// the legacy array-index route, kept only to redirect old bookmarked links
// (which only ever had a static-file index, never a real id) to the real
// id-based detail page.
//
// The match is exact against name+form+strength, not fuzzy — reliable
// because data/medications.json is the literal seed source for this table
// (prisma/seed.ts), so a given static-file entry's identity should match
// exactly one real row (or none, if that entry was skipped at seed time
// for missing a required field).
export function findCatalogEntryByIdentity(name: string, form: string, strength: string) {
  return prisma.medicationCatalogEntry.findFirst({
    where: { name, form, strength },
    select: { id: true },
  });
}
