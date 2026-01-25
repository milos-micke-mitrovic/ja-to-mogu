import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { GuideSidebar } from '@/components/layouts/guide-sidebar';
import { DashboardContent } from '@/components/layouts/dashboard-content';
import { SidebarProvider } from '@/contexts';
import { TooltipProvider } from '@/components/ui';

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
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background">
          <GuideSidebar user={session.user} />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
