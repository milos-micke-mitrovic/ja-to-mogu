import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ClientHeader } from '@/components/layouts/client-header';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default async function ClientLayout({ children }: ClientLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Only allow CLIENT role (or ADMIN for testing)
  if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
    // Redirect to home - type assertion needed for typed routes
    redirect('/' as Parameters<typeof redirect>[0]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ClientHeader user={session.user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
