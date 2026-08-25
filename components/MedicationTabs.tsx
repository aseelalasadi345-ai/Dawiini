"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const tabs = [
  { key: "today", href: "/today" },
  { key: "medications", href: "/medications" },
  { key: "saved", href: "/saved" },
];

export default function MedicationTabs() {
  const t = useTranslations("medicationTabs");
  const pathname = usePathname();

  return (
    <div className="flex p-1 rounded-[var(--radius-lg)] mb-6 bg-surface border border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors active:scale-[0.98] ${
              isActive
                ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white"
                : "text-muted hover:text-foreground hover:bg-background"
            }`}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </div>
  );
}