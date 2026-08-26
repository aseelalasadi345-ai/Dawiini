"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "en" ? "ar" : "en";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/Dawiini_Logo_cropped.png"
            alt="Dawiini"
            width={462}
            height={137}
            priority
            className="h-9 w-auto md:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-brand-navy hover:text-brand-blue"
          >
            {t("howItWorks")}
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={pathname}
            locale={otherLocale}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-navy hover:bg-brand-mist"
          >
            {t("langSwitch")}
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-mist"
          >
            {t("login")}
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            {t("signUp")}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/signup"
            className="rounded-lg bg-brand-gradient px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            {t("signUp")}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-lg text-brand-navy transition-colors hover:bg-brand-mist"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-brand-border px-6 py-4 md:hidden">
          <a
            href="#how-it-works"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm font-medium text-brand-navy hover:text-brand-blue"
          >
            {t("howItWorks")}
          </a>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-2 block rounded-lg border border-brand-blue px-4 py-2 text-center text-sm font-semibold text-brand-blue hover:bg-brand-mist"
          >
            {t("login")}
          </Link>
          <Link
            href={pathname}
            locale={otherLocale}
            onClick={() => setMenuOpen(false)}
            className="mt-2 block rounded-lg border border-brand-border px-4 py-2 text-center text-sm font-medium text-brand-navy hover:bg-brand-mist"
          >
            {t("langSwitch")}
          </Link>
        </div>
      )}
    </header>
  );
}