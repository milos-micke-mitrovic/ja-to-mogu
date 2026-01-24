'use client';

import { Logo } from '@/components/ui/logo';

export function AuthHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <Logo size="lg" />
      </div>
    </header>
  );
}
