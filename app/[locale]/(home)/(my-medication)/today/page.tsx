"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import DoseList from "@/components/DoseList";
import { Dose, DoseStatus } from "../../../../../lib/types";
import TodayPageList from "./TodayPageList";

//const doses = await getTodayDoses();

export default function TodayPage() {
  const t = useTranslations("today");
  //const [doses, setDoses] = useState<Dose[]>(doses);

  const handleStatusChange = (id: string, status: DoseStatus) => {
    //setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
      {/* <TodayPageList initialDoses={doses} /> */}
    </div>
  );
}