"use client";

import { use } from "react";
import { useTranslations } from "next-intl";

interface PharmaciesPageProps {
  searchParams: Promise<{ medicationId?: string }>;
}

export default function PharmaciesPage({ searchParams }: PharmaciesPageProps) {
  const { medicationId } = use(searchParams);
  const t = useTranslations("pharmacies");

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-2 text-foreground">
        {t("title")}
      </h1>
      <p className="text-sm text-muted">
        {medicationId
          ? `${t("filteredBy")} ${medicationId}`
          : t("subtitle")}
      </p>
    </div>
  );
}
