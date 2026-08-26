"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, usePathname, useRouter } from "../i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Menu, X } from "lucide-react";
import { notifications } from "@/lib/mock/notifications";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navbar");
  const unreadCount = notifications.filter((n) => n.unread).length;
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("home"), href: "/home" },
    { label: t("search"), href: "/search" },
    { label: t("my-medication"), href: "/today" },
    { label: t("pharmacies"), href: "/pharmacies" },
  ];

  const switchLocale = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="border-b border-border bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/home" className="flex items-center">
          <Image
            src="/images/Dawiini_Logo_cropped.png"
            alt="Dawiini"
            width={462}
            height={137}
            priority
            className="h-9 w-auto md:h-12"
          />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={
                    isActive
                      ? "text-primary font-medium bg-primary-light px-3 py-1.5 rounded-lg"
                      : "text-muted hover:text-foreground hover:bg-background active:bg-border px-3 py-1.5 rounded-lg transition-colors"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={switchLocale}
            className="hidden border border-border rounded-full px-4 py-1.5 text-sm text-muted transition-colors hover:bg-background active:bg-border md:block"
          >
            {locale === "en" ? "عربي" : "English"}
          </button>

          <Link
            href="/notifications"
            className="relative p-1.5 rounded-full transition-colors hover:bg-background active:bg-border"
            aria-label={t("notifications")}
          >
            <Bell className="w-5 h-5 text-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/personal-profile"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-avatar-gradient-start to-avatar-gradient-end text-white flex items-center justify-center font-semibold transition-transform hover:opacity-90 active:scale-95"
            aria-label={t("profile")}
          >
            S
          </Link>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-full text-muted transition-colors hover:bg-background active:bg-border md:hidden"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={
                      isActive
                        ? "block text-primary font-medium bg-primary-light px-3 py-2 rounded-lg"
                        : "block text-muted hover:text-foreground hover:bg-background active:bg-border px-3 py-2 rounded-lg transition-colors"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => {
              switchLocale();
              setMenuOpen(false);
            }}
            className="mt-3 w-full border border-border rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-background active:bg-border"
          >
            {locale === "en" ? "عربي" : "English"}
          </button>
        </div>
      )}
    </nav>
  );
}
