import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { Link } from '@/i18n/routing';

const RECENT_SEARCHES = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Metformin 850mg', 'Omeprazole 20mg'];

export default function RecentSearchesSection() {
  const t = useTranslations('home');

  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-brand-navy">{t('recentSearches')}</h2>
      <div className="flex flex-wrap gap-2">
        {RECENT_SEARCHES.map((query) => (
          <Link
            key={query}
            href={`/search?q=${encodeURIComponent(query)}`}
            className="flex items-center gap-2 rounded-full border border-brand-border bg-white px-4 py-2 text-sm text-brand-navy hover:bg-brand-mist"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            {query}
          </Link>
        ))}
      </div>
    </section>
  );
}
