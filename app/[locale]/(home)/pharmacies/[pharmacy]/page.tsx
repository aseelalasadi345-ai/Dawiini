"use client";

import { use } from "react";
import { useTranslations } from "next-intl";

interface PharmacyDetailPageProps {
  params: Promise<{ pharmacy: string }>;
}

export default function PharmacyDetailPage({
  params,
}: PharmacyDetailPageProps) {
  const { pharmacy } = use(params);
  const t = useTranslations("pharmacies");

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-2 text-foreground capitalize">
        {pharmacy.replace(/-/g, " ")}
      </h1>
      <p className="text-sm text-muted">{t("detailPlaceholder")}</p>
    </div>
  );
}
