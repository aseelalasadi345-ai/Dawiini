import Navbar2 from "@/components/Navbar2";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Navbar2 />
      <main className="px-6 py-16">{children}</main>
    </div>
  );
}
