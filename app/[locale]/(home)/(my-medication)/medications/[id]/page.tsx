import { ChevronLeft, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import SaveMedicationButton from "@/components/SaveMedicationButton";

interface MedicationDetailPageProps {
  params: Promise<{ id: string }>;
}

// Server Component, real MedicationCatalogEntry lookup by its actual
// database id — replaces the old array-index-into-a-static-JSON-file
// version of this page (see .../medications/moph/[index]/page.tsx, now kept
// only to redirect old bookmarked links here).
//
export default async function MedicationDetailPage({ params }: MedicationDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("mophDrugDetail");

  const medication = await prisma.medicationCatalogEntry.findUnique({ where: { id } });

  if (!medication) {
    return <p className="p-6 text-muted text-center">{t("notFound")}</p>;
  }

  const sessionUser = await getSessionUser();
  let isSaved = false;
  if (sessionUser) {
    const saved = await prisma.savedMedication.findUnique({
      where: { userId_catalogEntryId: { userId: sessionUser.id, catalogEntryId: id } },
      select: { id: true },
    });
    isSaved = !!saved;
  }

  // Real query against PharmacyMedicationAvailability — but that table has
  // no admin/manual-entry path and no automated pharmacy-inventory feed yet
  // (see its schema comment), so this will return zero rows for every
  // medication right now. That's the honest state, not a bug: it drives the
  // "no availability info" message below rather than a fake pharmacy list.
  // Once a real feed populates this table, rows show up here automatically
  // — no code change needed on that day. Deliberately no distance/sorting
  // logic: nothing in the app computes distance yet (Pharmacy has lat/lng,
  // but no page uses it), so that's out of scope here too.
  const availability = await prisma.pharmacyMedicationAvailability.findMany({
    where: { catalogEntryId: id },
    include: { pharmacy: true },
    orderBy: { pharmacy: { name: "asc" } },
  });

  const details: { label: string; value?: string | null }[] = [
    { label: t("ingredients"), value: medication.ingredients },
    { label: t("atcCode"), value: medication.atcCode },
    { label: t("category"), value: medication.bg },
    { label: t("price"), value: medication.price },
  ].filter((d) => d.value);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 p-6">
      <Link
        href="/search"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground w-fit"
      >
        <ChevronLeft size={16} />
        {t("back")}
      </Link>

      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{medication.name}</h1>
            {medication.nameAr && (
              <p className="text-sm text-muted mt-1" dir="rtl">
                {medication.nameAr}
              </p>
            )}
          </div>
          <SaveMedicationButton catalogEntryId={medication.id} initialIsSaved={isSaved} />
        </div>

        {(medication.form || medication.strength) && (
          <div className="flex flex-wrap gap-2">
            {medication.form && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                {medication.form}
              </span>
            )}
            {medication.strength && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                {medication.strength}
              </span>
            )}
          </div>
        )}

        {details.length > 0 && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {details.map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-muted">{d.label}</dt>
                <dd className="text-foreground">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {medication.sourceUrl && (
          <a
            href={medication.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium w-fit hover:underline"
          >
            {t("viewOnMoph")}
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">{t("nearbyPharmacies")}</h2>

        {availability.length === 0 ? (
          <p className="text-sm text-muted">{t("noAvailabilityInfo")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {availability.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-background"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.pharmacy.name}
                  </p>
                  <p className="text-xs text-muted truncate">{entry.pharmacy.address}</p>
                </div>
                <span className="text-xs font-medium text-muted shrink-0">
                  {t(`stockLevel.${entry.level}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
