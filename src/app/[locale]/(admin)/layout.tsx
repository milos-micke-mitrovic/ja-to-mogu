import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminSidebar } from '@/components/layouts/admin-sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login' as Parameters<typeof redirect>[0]);
  }

  // Only allow ADMIN role
  if (session.user.role !== 'ADMIN') {
    redirect('/' as Parameters<typeof redirect>[0]);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto lg:ml-64">{children}</main>
    </div>
  );
}
