"use client";

import Image from "next/image";
import { Link, usePathname, useRouter } from "../i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navbar");

  const navLinks = [
    { label: t("home"), href: "/" },
    { label: t("search"), href: "/search" },
    { label: t("my-medication"), href: "/medications" },
    { label: t("pharmacies"), href: "/pharmacies" },
  ];

  const switchLocale = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
      <Link href="/" className="flex items-center">
        <Image
          src="/images/Dawiini_Logo_cropped.png"
          alt="Dawiini"
          width={462}
          height={137}
          priority
          className="h-10 w-auto md:h-12"
        />
      </Link>

      <ul className="flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  isActive
                    ? "text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
                    : "text-gray-500 hover:text-gray-800 px-3 py-1.5"
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-4">
        <button
          onClick={switchLocale}
          className="border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          {locale === "en" ? "عربي" : "English"}
        </button>

        <Link
          href="/notifications"
          className="relative"
          aria-label={t("notifications") ?? "Notifications"}
        >
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </Link>

        <Link
          href="/personal-profile"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold"
          aria-label={t("profile") ?? "Profile"}
        >
          S
        </Link>
      </div>
    </nav>
  );
}