import AdminFormCard from '@/components/admin/AdminFormCard';
import PharmacyForm from '@/components/admin/PharmacyForm';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-brand-mist px-6 py-16">
      <AdminFormCard>
        <PharmacyForm />
      </AdminFormCard>
    </div>
  );
}
