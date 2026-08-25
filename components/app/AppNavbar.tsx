'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Bell } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';

const NAV_ITEMS = [
  { key: 'home', href: '/home' },
  { key: 'search', href: '/search' },
  { key: 'myMedications', href: '/my-medications' },
  { key: 'pharmacies', href: '/pharmacies' },
] as const;

export default function AppNavbar({
  userInitial = 'S',
  unreadCount = 3,
}: {
  userInitial?: string;
  unreadCount?: number;
}) {
  const t = useTranslations('appNav');
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/home" className="flex items-center gap-2 text-lg font-bold text-brand-navy">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gradient text-sm font-bold text-white">
              D
            </span>
            Dawiini
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={
                    'rounded-lg px-3 py-1.5 text-sm font-medium ' +
                    (active
                      ? 'bg-blue-50 text-brand-blue'
                      : 'text-brand-ink hover:bg-brand-mist hover:text-brand-navy')
                  }
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={pathname}
            locale={otherLocale}
            className="rounded-lg border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-mist"
          >
            {locale === 'en' ? 'عربي' : 'English'}
          </Link>

          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-brand-ink hover:bg-brand-mist"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 end-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
            {userInitial}
          </span>
        </div>
      </div>
    </header>
  );
}
