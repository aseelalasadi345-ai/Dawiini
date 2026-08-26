import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function OnboardingHeader() {
  const t = useTranslations('onboarding');

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="flex items-center rounded-lg bg-white px-3 py-1.5 shadow-sm">
        <Image
          src="/images/Dawiini_Logo_cropped.png"
          alt="Dawiini"
          width={462}
          height={137}
          className="h-6 w-auto"
        />
      </span>
      <Link href="/home" className="text-sm text-slate-400 hover:text-brand-navy">
        {t('skipAll')}
      </Link>
    </div>
  );
}
