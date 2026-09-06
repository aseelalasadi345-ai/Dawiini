import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import medicationsData from "@/data/medications.json";
import { findCatalogEntryByIdentity } from "@/lib/medicationCatalogEntry";

interface LegacyMophRedirectProps {
  params: Promise<{ index: string }>;
}

// This route used to BE the medication detail page, keyed by a raw array
// index into the static data/medications.json bundle. It's now real-id
// based (see .../medications/[id]/page.tsx) — this file only exists so old
// bookmarked/shared /medications/moph/{index} links still go somewhere
// sensible instead of breaking outright: resolve the index's identity
// (name+form+strength — same match the save feature's /resolve endpoint
// uses) to the real MedicationCatalogEntry id and redirect there. An
// out-of-range index, or a static-file entry that was skipped at seed time
// for missing a required field (prisma/seed.ts), 404s cleanly instead of
// silently rendering nothing.
export default async function LegacyMophMedicationRedirect({ params }: LegacyMophRedirectProps) {
  const { index } = await params;
  const medication = medicationsData.medications[Number(index)];

  if (!medication?.name || !medication?.form || !medication?.strength) {
    notFound();
  }

  const catalogEntry = await findCatalogEntryByIdentity(
    medication.name,
    medication.form,
    medication.strength,
  );
  if (!catalogEntry) {
    notFound();
  }

  const locale = await getLocale();
  redirect({ href: `/medications/${catalogEntry.id}`, locale });
}
