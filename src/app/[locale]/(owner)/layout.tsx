import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { OwnerHeader } from '@/components/layouts/owner-header';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export default async function OwnerLayout({ children }: OwnerLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login' as Parameters<typeof redirect>[0]);
  }

  // Only allow OWNER role (or ADMIN for testing)
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    redirect('/' as Parameters<typeof redirect>[0]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OwnerHeader user={session.user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
