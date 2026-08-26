import { useTranslations } from 'next-intl';
import { Search, Navigation } from 'lucide-react';

const PHARMACIES = [
  { key: 'alDawaa', distance: '0.3 km', inStock: true },
  { key: 'nahdi', distance: '0.8 km', inStock: true },
  { key: 'rayi', distance: '1.2 km', inStock: false },
] as const;

export default function PhoneMockup() {
  const t = useTranslations('hero');

  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      {/* phone frame */}
      <div className="rounded-[2.5rem] border-[10px] border-brand-navy bg-brand-navy shadow-2xl">
        <div className="mx-auto mb-1 mt-2 h-1.5 w-16 rounded-full bg-white/20" />
        <div className="rounded-[2rem] bg-white p-4">
          {/* search bar */}
          <div className="flex items-center gap-2 rounded-xl bg-brand-mist px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="force-ltr truncate text-sm text-slate-500">
              {t('searchPlaceholder')}
            </span>
          </div>

          <p className="mb-2 mt-4 text-sm font-semibold text-brand-navy">
            {t('nearbyPharmacies')}
          </p>

          <ul className="space-y-2">
            {PHARMACIES.map((pharmacy) => (
              <li
                key={pharmacy.key}
                className="flex items-center justify-between rounded-xl border border-brand-border px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-brand-navy">
                    {t(`pharmacies.${pharmacy.key}`)}
                  </p>
                  <p className="force-ltr text-xs text-slate-400">{pharmacy.distance}</p>
                </div>
                <span
                  className={
                    'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                    (pharmacy.inStock
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-500')
                  }
                >
                  {pharmacy.inStock ? `✓ ${t('inStock')}` : `✕ ${t('outOfStock')}`}
                </span>
              </li>
            ))}
          </ul>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white">
            {t('getDirections')}
            <Navigation className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* floating "in stock / updated" tooltip */}
      <div className="absolute -right-6 top-16 hidden w-44 rounded-xl border border-brand-border bg-white p-3 shadow-lg sm:block rtl:-left-6 rtl:right-auto">
        <p className="text-sm font-semibold text-emerald-600">✓ {t('inStockBadge')}</p>
        <p className="text-xs text-slate-400">{t('updated')}</p>
      </div>

      {/* floating "dose due" tooltip */}
      <div className="absolute -left-8 bottom-28 w-44 rounded-xl border border-brand-border bg-white p-3 shadow-lg rtl:-right-8 rtl:left-auto">
        <p className="text-sm font-semibold text-amber-500">⏰ {t('doseTitle')}</p>
        <p className="text-xs text-slate-400">{t('doseTime')}</p>
      </div>
    </div>
  );
}