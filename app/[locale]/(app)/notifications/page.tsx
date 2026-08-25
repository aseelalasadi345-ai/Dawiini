'use client';

import { useTranslations } from 'next-intl';
import { AlarmClock, CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import NotificationItem from '@/components/app/NotificationItem';

const ITEMS = [
  { key: 'doseReminder', icon: AlarmClock, iconBg: 'bg-rose-50', iconColor: 'text-rose-500', unread: true },
  { key: 'backInStock', icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', unread: true },
  { key: 'morningDoseTaken', icon: CheckCircle2, iconBg: 'bg-rose-50', iconColor: 'text-rose-500', unread: false },
  { key: 'refillNeeded', icon: AlertTriangle, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', unread: false },
  { key: 'availabilityUpdate', icon: Package, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', unread: false },
] as const;

export default function NotificationsPage() {
  const t = useTranslations('notificationsPage');

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">{t('title')}</h1>
        <button className="text-sm font-medium text-brand-blue hover:underline">{t('markAllRead')}</button>
      </div>

      <div className="space-y-3">
        {ITEMS.map((item) => (
          <NotificationItem
            key={item.key}
            icon={item.icon}
            iconBg={item.iconBg}
            iconColor={item.iconColor}
            unread={item.unread}
            title={t(`items.${item.key}.title`)}
            description={t(`items.${item.key}.description`)}
            time={t(`items.${item.key}.time`)}
          />
        ))}
      </div>
    </div>
  );
}
