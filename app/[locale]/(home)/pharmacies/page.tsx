import { MapPin, Navigation, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

// Server Component — queries Prisma directly (same pattern as
// app/[locale]/layout.tsx and .../home/page.tsx's getTranslations), no
// client state needed since there's nothing left to filter by yet (see
// below). Replaces the old lib/mock/pharmacies.ts-backed version.
//
// Deliberately dropped from the old mock version, all because the fields
// they depended on are out of scope this round (see the completion report):
// - The medicationId-driven "which pharmacies stock this drug" filtering,
//   the filter bar (open now / in stock / nearby), and the legend — all
//   keyed off mock isOpen/availability/distanceKm, none of which exist on
//   the real Pharmacy model.
// - The absolutely-positioned mock map (pharmacy.mapPosition doesn't exist
//   on real data either).
function directionsHref(pharmacy: { name: string; address: string }): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${pharmacy.name} ${pharmacy.address}`,
  )}`;
}

export default async function PharmaciesPage() {
  const t = await getTranslations("pharmacies");
  const pharmacies = await prisma.pharmacy.findMany({ orderBy: { name: "asc" } });
  // No "today's hours" preview here — PharmacyHours.days is free text (the
  // seeded data mixes single days and ranges like "Monday – Saturday"), so
  // matching it against today's day name isn't reliable. The full per-day
  // breakdown lives on the detail page (one tap away via the card link);
  // this compact card just distinguishes 24-hour pharmacies from the rest.

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
      </div>

      {pharmacies.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="rounded-2xl bg-surface border border-border shadow-sm p-4 flex flex-col gap-3"
            >
              <Link
                href={`/pharmacies/${pharmacy.id}`}
                className="flex items-start justify-between gap-3 rounded-lg -m-1 p-1 transition-colors hover:bg-background active:bg-border"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{pharmacy.name}</p>
                  <p className="text-xs text-muted mt-0.5">{pharmacy.address}</p>
                  <p className="text-xs text-muted mt-1.5">
                    {pharmacy.is24Hours ? t("open24") : t("seeHours")}
                  </p>
                </div>
              </Link>

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
                  href={directionsHref(pharmacy)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <Navigation size={14} />
                  {t("directions")}
                </a>
                {pharmacy.mapUrl && (
                  <a
                    href={pharmacy.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
                  >
                    <MapPin size={14} />
                    {t("map")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
