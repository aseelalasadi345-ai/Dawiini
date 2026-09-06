"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("profile");
  const pathname = usePathname();
  // Name/email come straight from AuthProvider (the session), not a
  // useProfile() fetch — they're already known synchronously (seeded
  // server-side in app/[locale]/layout.tsx), so there's no loading state to
  // handle here and no reason to duplicate the GET /api/profile request
  // every sub-page under this layout would otherwise trigger again.
  const { user } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const initial = user?.firstName.charAt(0).toUpperCase() || "?";

  const tabs = [
    { href: "/personal-profile", label: t("tabs.personalInfo") },
    { href: "/health-profile", label: t("tabs.healthInfo") },
    { href: "/settings", label: t("tabs.settings") },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-avatar-gradient-start to-avatar-gradient-end text-white flex items-center justify-center text-xl font-bold shrink-0">
          {initial}
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{fullName || "—"}</p>
          <p className="text-sm text-muted">{user?.email ?? "—"}</p>
        </div>
      </div>

      <div className="flex bg-surface border border-border rounded-xl p-1 gap-1">
        {tabs.map((tabItem) => {
          const isActive = pathname === tabItem.href;
          return (
            <Link
              key={tabItem.href}
              href={tabItem.href}
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] ${
                isActive
                  ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white"
                  : "text-muted hover:text-foreground hover:bg-background"
              }`}
            >
              {tabItem.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
