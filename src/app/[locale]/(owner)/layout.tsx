'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { OwnerHeader } from '@/components/layouts/owner-header';

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Only allow OWNER role (or ADMIN for testing)
    if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
      router.push('/' as Parameters<typeof router.push>[0]);
      return;
    }

    setIsAuthorized(true);
  }, [session, status, router]);

  if (status === 'loading' || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground-muted">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <OwnerHeader user={session?.user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
