import { useTranslations } from 'next-intl';
import { Camera, MapPinned } from 'lucide-react';
import HomeGreeting from '@/components/app/HomeGreeting';
import HomeSearchBar from '@/components/app/HomeSearchBar';
import QuickActionCard from '@/components/app/QuickActionCard';
import TodayDosesSection from '@/components/app/TodayDosesSection';
import RecentSearchesSection from '@/components/app/RecentSearchesSection';

export default function DashboardHomePage() {
  const t = useTranslations('home');

  return (
    <div>
      <HomeGreeting name="Sara" />
      <HomeSearchBar />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickActionCard
          icon={Camera}
          iconBg="bg-blue-50"
          iconColor="text-brand-blue"
          title={t('scanPrescription')}
          subtitle={t('scanPrescriptionSub')}
          href="/scan"
        />
        <QuickActionCard
          icon={MapPinned}
          iconBg="bg-sky-50"
          iconColor="text-sky-500"
          title={t('findPharmacies')}
          subtitle={t('findPharmaciesSub')}
          href="/pharmacies"
        />
      </div>

      <TodayDosesSection />
      <RecentSearchesSection />
    </div>
  );
}
