import type { ElementType } from 'react';

export default function NotificationItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  time,
  unread,
}: {
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-brand-border bg-white p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-brand-navy">{title}</p>
          {unread && <span className="h-2 w-2 rounded-full bg-brand-blue" />}
        </div>
        <p className="mt-1 text-sm text-brand-ink">{description}</p>
        <p className="mt-1.5 text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}
