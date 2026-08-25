import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-brand-border bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 sm:flex-row">
        <span className="flex items-center gap-2 font-bold text-brand-navy">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-gradient text-xs font-bold text-white">
            D
          </span>
          Dawiini
        </span>

        <p className="text-center">{t('disclaimer')}</p>

        <div className="flex items-center gap-4">
          <span>{t('copyright')}</span>
          <Link href="/staff" className="font-medium text-brand-navy hover:text-brand-blue">
            {t('staffPortal')} ↗
          </Link>
        </div>
      </div>
    </footer>
  );
}