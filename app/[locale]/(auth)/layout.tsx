import Navbar from '@/components/Navbar';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Navbar />
      <main className="px-6 py-16">{children}</main>
    </div>
  );
}