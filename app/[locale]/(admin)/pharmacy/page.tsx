import { notFound } from 'next/navigation';
import AdminFormCard from '@/components/admin/AdminFormCard';
import PharmacyForm from '@/components/admin/PharmacyForm';
import { isAdmin } from '@/lib/auth/session';

// 404s for anyone who isn't an admin — signed out or signed in — rather than
// redirecting to login/home. This is an internal tool, not a page a regular
// user should ever be told exists; 404 doesn't confirm there's something
// here to be denied access to, the way a redirect-with-message would.
export default async function AdminPage() {
  if (!(await isAdmin())) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-brand-mist px-6 py-16">
      <AdminFormCard>
        <PharmacyForm />
      </AdminFormCard>
    </div>
  );
}
