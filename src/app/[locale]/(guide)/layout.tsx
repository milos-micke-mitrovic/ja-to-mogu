import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { GuideHeader } from '@/components/layouts/guide-header';

interface GuideLayoutProps {
  children: React.ReactNode;
}

export default async function GuideLayout({ children }: GuideLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login' as Parameters<typeof redirect>[0]);
  }

  // Only allow GUIDE role (or ADMIN for testing)
  if (session.user.role !== 'GUIDE' && session.user.role !== 'ADMIN') {
    redirect('/' as Parameters<typeof redirect>[0]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GuideHeader user={session.user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
