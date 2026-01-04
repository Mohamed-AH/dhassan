import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-bg-cream">
      <AdminNav />
      <main>{children}</main>
    </div>
  );
}
