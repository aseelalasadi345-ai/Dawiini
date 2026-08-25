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
        className="p-1.5 rounded-md text-muted transition-colors duration-150 hover:bg-background hover:text-foreground active:bg-border"
        aria-label={t("openMenu")}
      >
        •••
      </button>

      {open && (
        <div className="absolute end-0 mt-1 w-48 rounded-lg bg-white border border-border shadow-lg z-10 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                item.action();
                setOpen(false);
              }}
              className={`w-full text-start px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                item.danger
                  ? "text-danger-strong hover:bg-danger-light active:bg-danger-light-border"
                  : "text-foreground hover:bg-background active:bg-border"
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