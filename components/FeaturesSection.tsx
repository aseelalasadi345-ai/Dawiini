import { useTranslations } from 'next-intl';
import { Zap, Camera, Bell, Globe2 } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function FeaturesSection() {
  const t = useTranslations('features');

  const items = [
    {
      key: 'availability',
      icon: Zap,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      key: 'scanner',
      icon: Camera,
      iconBg: 'bg-blue-50',
      iconColor: 'text-brand-blue',
    },
    {
      key: 'reminders',
      icon: Bell,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      key: 'bilingual',
      icon: Globe2,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
  ] as const;

  return (
    <section className="bg-brand-mist py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">{t('title')}</h2>
          <p className="mt-3 text-brand-ink">{t('subtitle')}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <FeatureCard
              key={item.key}
              icon={item.icon}
              iconBg={item.iconBg}
              iconColor={item.iconColor}
              title={t(`items.${item.key}.title`)}
              description={t(`items.${item.key}.description`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}