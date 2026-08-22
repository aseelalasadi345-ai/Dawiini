import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import MedicationTabs from "@/components/MedicationTabs";
import { MedicationsProvider } from "@/components/MedicationsProvider";
import { SavedMedicationsProvider } from "@/components/SavedMedicationsProvider";

export default function MyMedicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MedicationsProvider>
      <SavedMedicationsProvider>
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[28px] font-bold text-foreground">
              My Medications
            </h1>
            <Link
              href="/add"
              className="flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2.5 rounded-[var(--radius-md)] bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add
            </Link>
          </div>

          <MedicationTabs />

          {children}
        </main>
      </SavedMedicationsProvider>
    </MedicationsProvider>
  );
}