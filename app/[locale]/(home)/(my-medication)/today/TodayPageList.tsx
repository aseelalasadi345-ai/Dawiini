// app/[locale]/(home)/today/TodayPageList.tsx  (Today page)
"use client";

import { useState } from "react";
import DoseList from "@/components/DoseList";
import { Dose, DoseStatus } from "@/lib/types";

export default function TodayPageList({
  initialDoses,
}: {
  initialDoses: Dose[];
}) {
  const [doses, setDoses] = useState(initialDoses);

  function handleStatusChange(id: string, status: DoseStatus) {
    setDoses((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    // TODO: call your API/server action here to persist
  }

  return (
    <DoseList
      doses={doses}
      onStatusChange={handleStatusChange}
      variant="full"
    />
  );
}