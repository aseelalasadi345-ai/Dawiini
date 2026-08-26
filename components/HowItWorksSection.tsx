import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const STEPS = [
  { key: 'search', badgeClass: 'bg-brand-blue' },
  { key: 'availability', badgeClass: 'bg-brand-teal' },
  { key: 'pharmacy', badgeClass: 'bg-brand-navy' },
] as const;

export default function HowItWorksSection() {
  const t = useTranslations('howItWorks');

  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">{t('title')}</h2>

        <div className="relative mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
          {/* connecting line, desktop only */}
          <div className="absolute top-7 hidden h-px w-full bg-brand-border sm:block" />

          {STEPS.map((step, index) => (
            <div key={step.key} className="relative flex flex-col items-center">
              <span
                className={`z-10 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white ${step.badgeClass}`}
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-brand-navy">
                {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-2 max-w-xs text-sm text-brand-ink">
                {t(`steps.${step.key}.description`)}
              </p>
            </div>
          ))}
        </div>

        <Link
          href="/signup"
          className="mt-14 inline-block rounded-xl bg-brand-gradient px-8 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  );
}