export default function AdminFormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-brand-border bg-white p-8 shadow-sm sm:p-10">
      {children}
    </div>
  );
}
