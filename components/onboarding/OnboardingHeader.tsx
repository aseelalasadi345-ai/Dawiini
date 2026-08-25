import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function OnboardingHeader() {
  const t = useTranslations('onboarding');

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-lg font-bold text-brand-navy shadow-sm">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gradient text-sm font-bold text-white">
          D
        </span>
        Dawiini
      </span>
      <Link href="/home" className="text-sm text-slate-400 hover:text-brand-navy">
        {t('skipAll')}
      </Link>
    </div>
  );
}
