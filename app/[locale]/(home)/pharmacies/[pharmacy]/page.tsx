"use client";

import { use } from "react";
import { Check, ChevronLeft, Navigation, Phone, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getPharmacy } from "@/lib/mock/pharmacies";

interface PharmacyDetailPageProps {
  params: Promise<{ pharmacy: string }>;
}

export default function PharmacyDetailPage({ params }: PharmacyDetailPageProps) {
  const { pharmacy: pharmacyId } = use(params);
  const t = useTranslations("pharmacies");
  const td = useTranslations("pharmacyDetail");

  const pharmacy = getPharmacy(pharmacyId);

  if (!pharmacy) {
    return <p className="p-6 text-muted text-center">{td("notFound")}</p>;
  }

  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${pharmacy.name} ${pharmacy.address}`,
  )}`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">
      <Link
        href="/pharmacies"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground w-fit"
      >
        <ChevronLeft size={16} />
        {td("back")}
      </Link>

      {/* Mock map */}
      <div className="relative rounded-2xl border border-border overflow-hidden h-40 bg-background">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-border/60 bg-border/10" />
          ))}
        </div>
        <div
          className="absolute w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-xs -translate-x-1/2 -translate-y-1/2 shadow-sm"
          style={{ top: "50%", left: "50%" }}
        >
          +
        </div>
        <span className="absolute top-2 right-2 bg-surface/95 border border-border rounded-full px-2.5 py-1 text-xs text-muted">
          {pharmacy.distanceKm} km
        </span>
      </div>

      {/* Pharmacy card */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">{pharmacy.name}</h1>
          <p className="text-sm text-muted mt-0.5">{pharmacy.address}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              pharmacy.isOpen ? "bg-success-light text-success" : "bg-background text-muted"
            }`}
          >
            {pharmacy.isOpen ? t("open") : t("closed")}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Star size={12} className="fill-rating text-rating" />
            {pharmacy.rating.toFixed(1)} · {td("reviews", { count: pharmacy.reviewCount })}
          </span>
        </div>
        <div className="flex gap-2">
          <a
            href={`tel:${pharmacy.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
          >
            <Phone size={14} />
            {t("call")}
          </a>
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
      </div>

      {/* Opening hours */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">{td("openingHours")}</h2>
        <div className="flex flex-col gap-2">
          {pharmacy.hours.map((h) => (
            <div key={h.days} className="flex items-center justify-between text-sm">
              <span className="text-muted">{h.days}</span>
              <span className="text-foreground font-medium">{h.hours}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Medication availability */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {td("medicationAvailability")}
          </h2>
          <span className="text-xs text-muted">
            {t("updatedAgo", { minutes: pharmacy.updatedMinutesAgo })}
          </span>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {pharmacy.availability.map((item) => (
            <div
              key={item.medicationName}
              className="flex items-center justify-between py-2.5"
            >
              <span className="text-sm text-foreground">{item.medicationName}</span>
              <span
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  item.level === "out_of_stock" ? "text-danger" : "text-success"
                }`}
              >
                {item.level === "plenty" && td("plenty")}
                {item.level === "limited" && td("limited")}
                {item.level === "out_of_stock" && td("outOfStock")}
                {item.level === "out_of_stock" ? <X size={14} /> : <Check size={14} />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
