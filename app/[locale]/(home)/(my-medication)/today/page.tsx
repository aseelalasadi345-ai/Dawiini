"use client";

import { useTranslations } from "next-intl";
import { todayDoses } from "@/lib/mock/doses";
import TodayPageList from "./TodayPageList";

export default function TodayPage() {
  const t = useTranslations("today");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
      <TodayPageList initialDoses={todayDoses} />
    </div>
  );
}
