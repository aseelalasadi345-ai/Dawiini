import type { ElementType } from 'react';

export default function FeatureCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
      <span
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </span>
      <h3 className="mb-2 text-base font-semibold text-brand-navy">{title}</h3>
      <p className="text-sm leading-relaxed text-brand-ink">{description}</p>
    </div>
  );
}