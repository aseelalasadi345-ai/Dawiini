import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import DoseItem, { type Dose } from './DoseItem';

const DOSES: Dose[] = [
  { id: '1', name: 'Metformin 850mg', time: '08:00', taken: true },
  { id: '2', name: 'Omeprazole 20mg', time: '13:00', taken: false },
  { id: '3', name: 'Atorvastatin 40mg', time: '21:00', taken: false },
];

export default function TodayDosesSection() {
  const t = useTranslations('home');

  return (
    <section className="mb-6 rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-brand-navy">{t('todayDoses')}</h2>
        <Link href="/my-medications" className="text-sm font-medium text-brand-blue hover:underline">
          {t('seeAll')}
        </Link>
      </div>

      <div className="space-y-2">
        {DOSES.map((dose) => (
          <DoseItem key={dose.id} dose={dose} takeLabel={t('take')} snoozeLabel={t('snooze')} />
        ))}
      </div>
    </section>
  );
}
