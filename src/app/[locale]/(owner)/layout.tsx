import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { OwnerSidebar } from '@/components/layouts/owner-sidebar';
import { DashboardContent } from '@/components/layouts/dashboard-content';
import { SidebarProvider } from '@/contexts';
import { TooltipProvider } from '@/components/ui';

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
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background">
          <OwnerSidebar user={session.user} />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
