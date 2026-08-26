'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useState } from 'react';

export default function HomeSearchBar() {
  const t = useTranslations('home');
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-brand-blue bg-white px-4 py-3.5 shadow-sm"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
        <Search className="h-4 w-4 text-brand-blue" />
      </span>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder={t('searchPlaceholder')}
        className="w-full bg-transparent text-sm text-brand-navy placeholder:text-slate-400 focus:outline-none"
      />
    </form>
  );
}
