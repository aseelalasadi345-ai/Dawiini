import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import MedicationTabs from "@/components/MedicationTabs";

export default function MyMedicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-foreground">
          My Medications
        </h1>
        <Link
          href="/add"
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2.5 rounded-[var(--radius-md)] bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add
        </Link>
      </div>

      <MedicationTabs />

      {children}
    </main>
  );
}