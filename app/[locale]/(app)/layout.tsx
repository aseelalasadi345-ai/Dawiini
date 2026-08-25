import AppNavbar from '@/components/app/AppNavbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-mist">
      <AppNavbar />
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
