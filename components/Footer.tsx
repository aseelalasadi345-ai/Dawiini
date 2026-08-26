import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-brand-border bg-white py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 sm:flex-row">
        <Image
          src="/images/Dawiini_Logo_cropped.png"
          alt="Dawiini"
          width={462}
          height={137}
          className="h-6 w-auto"
        />

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