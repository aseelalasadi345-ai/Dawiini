import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import PhoneMockup from './PhoneMockup';

const AVATAR_INITIALS = ['S', 'A', 'M'];

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-mist to-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-brand-blue">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
            {t('badge')}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h1>

          <p className="mt-6 max-w-lg text-lg text-brand-ink">{t('subtitle')}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
            >
              {t('getStarted')}
            </Link>
            <button className="rounded-xl border border-brand-border px-6 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-mist">
              {t('watchDemo')}
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {AVATAR_INITIALS.map((initial, i) => (
                <span
                  key={initial}
                  className={
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ' +
                    [
                      'bg-brand-blue',
                      'bg-brand-teal',
                      'bg-brand-navy',
                    ][i % 3]
                  }
                >
                  {initial}
                </span>
              ))}
            </div>
            <p className="text-sm text-brand-ink">{t('trust')}</p>
          </div>
        </div>

        <div className="relative">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}