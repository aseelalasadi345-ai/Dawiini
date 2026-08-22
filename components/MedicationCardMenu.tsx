"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface MedicationCardMenuProps {
  medicationId: string;
  onEdit: (id: string) => void;
  onFindInPharmacy: (id: string) => void;
  onSetReminder: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MedicationCardMenu({
  medicationId,
  onEdit,
  onFindInPharmacy,
  onSetReminder,
  onDelete,
}: MedicationCardMenuProps) {
  const t = useTranslations("medicationCardMenu");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [
    { key: "edit", label: t("edit"), action: () => onEdit(medicationId) },
    {
      key: "findInPharmacy",
      label: t("findInPharmacy"),
      action: () => onFindInPharmacy(medicationId),
    },
    {
      key: "setReminder",
      label: t("setReminder"),
      action: () => onSetReminder(medicationId),
    },
    {
      key: "delete",
      label: t("delete"),
      action: () => onDelete(medicationId),
      danger: true,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md hover:bg-surface text-muted"
        aria-label={t("openMenu")}
      >
        •••
      </button>

      {open && (
        <div className="absolute end-0 mt-1 w-48 rounded-[var(--radius-lg)] bg-white border border-border shadow-lg z-10 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              className={`w-full text-start px-4 py-2.5 text-sm hover:bg-surface ${
                item.danger ? "text-red-600" : "text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}