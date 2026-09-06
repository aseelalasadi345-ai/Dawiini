import { ChevronLeft, MapPin, Navigation, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { sortHoursByDay } from "@/lib/pharmacyHours";

interface PharmacyDetailPageProps {
  params: Promise<{ pharmacy: string }>;
}

// Server Component, same pattern as the list page — see its comment for
// what was dropped and why (rating/reviews, live open/closed status,
// medication availability, the mapPosition mock map). Hours are now the
// real PharmacyHours relation (sorted Monday->Sunday where possible — see
// sortHoursByDay) instead of the flat opensAt/openUntil fields, which have
// been removed from the schema entirely.
export default async function PharmacyDetailPage({ params }: PharmacyDetailPageProps) {
  const { pharmacy: pharmacyId } = await params;
  const t = await getTranslations("pharmacies");
  const td = await getTranslations("pharmacyDetail");

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacyId },
    include: { hours: true },
  });

  if (!pharmacy) {
    return <p className="p-6 text-muted text-center">{td("notFound")}</p>;
  }

  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${pharmacy.name} ${pharmacy.address}`,
  )}`;
  const hours = sortHoursByDay(pharmacy.hours);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">
      <Link
        href="/pharmacies"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground w-fit"
      >
        <ChevronLeft size={16} />
        {td("back")}
      </Link>

      {/* Pharmacy card */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">{pharmacy.name}</h1>
          <p className="text-sm text-muted mt-0.5">{pharmacy.address}</p>
        </div>
        {pharmacy.is24Hours && (
          <p className="text-sm text-muted">{t("open24")}</p>
        )}
        <div className="flex gap-2">
          {pharmacy.phone && (
            <a
              href={`tel:${pharmacy.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
            >
              <Phone size={14} />
              {t("call")}
            </a>
          )}
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Navigation size={14} />
            {t("directions")}
          </a>
        </div>
        {pharmacy.mapUrl && (
          <a
            href={pharmacy.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
          >
            <MapPin size={14} />
            {t("map")}
          </a>
        )}
      </div>

      {/* Hours — real PharmacyHours rows. `days` is free text (seeded data
          mixes single days like "Sunday" with ranges like "Monday –
          Saturday"; the admin form now always writes one row per individual
          day), so this just prints whatever's stored rather than assuming
          a shape. Skipped when is24Hours is true — every row would just say
          "Open 24 hours" again, which the card above already states. */}
      {!pharmacy.is24Hours && hours.length > 0 && (
        <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">{td("hours")}</h2>
          <div className="flex flex-col gap-2">
            {hours.map((h) => (
              <div key={`${h.days}-${h.hours}`} className="flex items-center justify-between text-sm">
                <span className="text-muted">{h.days}</span>
                <span className="text-foreground font-medium">{h.hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
