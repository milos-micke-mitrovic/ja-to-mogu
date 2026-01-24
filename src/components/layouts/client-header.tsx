'use client';

import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { Link, usePathname } from '@/i18n/routing';
import { Button, Logo } from '@/components/ui';
import { LogOut, User, Home, Package, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientHeaderProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export function ClientHeader({ user }: ClientHeaderProps) {
  const t = useTranslations('navigation');
  const tDashboard = useTranslations('dashboard');
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: tDashboard('clientDashboard'), icon: Home },
    { href: '/packages', label: t('packages'), icon: Package },
    { href: '/history', label: tDashboard('bookingHistory'), icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - icon only on mobile */}
        <span className="sm:hidden">
          <Logo size="sm" showText={false} />
        </span>
        <span className="hidden sm:block">
          <Logo size="md" />
        </span>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground-muted hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">{user.name || user.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="border-t border-border md:hidden">
        <nav className="flex justify-around p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
