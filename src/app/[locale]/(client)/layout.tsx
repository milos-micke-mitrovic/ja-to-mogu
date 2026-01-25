import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ClientSidebar } from '@/components/layouts/client-sidebar';
import { DashboardContent } from '@/components/layouts/dashboard-content';
import { SidebarProvider } from '@/contexts';
import { TooltipProvider } from '@/components/ui';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default async function ClientLayout({ children }: ClientLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login' as Parameters<typeof redirect>[0]);
  }

  // Only allow CLIENT role (or ADMIN for testing)
  if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
    redirect('/' as Parameters<typeof redirect>[0]);
  }

  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen bg-background">
          <ClientSidebar user={session.user} />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
