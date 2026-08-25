'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-navy">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gradient text-sm font-bold text-white">
            D
          </span>
          Dawiini
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium text-brand-navy hover:text-brand-blue">
            {t('howItWorks')}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={pathname}
            locale={otherLocale}
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-navy hover:bg-brand-mist"
          >
            {t('langSwitch')}
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-mist"
          >
            {t('login')}
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            {t('signUp')}
          </Link>
        </div>
      </div>
    </header>
  );
}