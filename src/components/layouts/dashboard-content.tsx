'use client';

import { useSidebar } from '@/contexts';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DashboardContentProps {
  children: ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { isCollapsed, isLoaded } = useSidebar();

  return (
    <main
      className={cn(
        'flex-1 overflow-y-auto',
        isLoaded && 'transition-[margin] duration-200',
        isCollapsed ? 'sm:ml-16' : 'sm:ml-64'
      )}
    >
      {children}
    </main>
  );
}
