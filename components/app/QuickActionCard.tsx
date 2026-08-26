import type { ElementType } from 'react';
import { Link } from '@/i18n/routing';

export default function QuickActionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  href,
}: {
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-brand-border bg-white p-5 shadow-sm hover:bg-brand-mist"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-brand-navy">{title}</span>
        <span className="block text-xs text-slate-400">{subtitle}</span>
      </span>
    </Link>
  );
}
