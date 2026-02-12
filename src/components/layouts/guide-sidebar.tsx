'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { Link, usePathname } from '@/i18n/routing';
import { Button, Logo } from '@/components/ui';
import { useSidebar } from '@/contexts';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuideSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function GuideSidebar({ user }: GuideSidebarProps) {
  const t = useTranslations('guideDashboard');
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isCollapsed, isLoaded, toggleCollapsed } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/guide') {
      return pathname === '/guide' || pathname === '/guide/';
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: '/guide', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/guide/clients', icon: Users, label: t('clients') },
    { href: '/guide/availability', icon: Calendar, label: t('availability') },
    { href: '/guide/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-border bg-background sm:flex',
          isLoaded && 'transition-all duration-200',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-border',
            isCollapsed ? 'justify-center px-2' : 'gap-2 px-6'
          )}
        >
          <Logo size="md" showText={false} />
          {!isCollapsed && (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Vodič
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1 py-4', isCollapsed ? 'px-2' : 'px-3')}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-lg text-sm font-medium transition-colors',
                  isCollapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-3 px-3 py-2.5',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground-muted hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={cn('border-t border-border', isCollapsed ? 'p-2' : 'p-4')}>
          {!isCollapsed ? (
            <>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserCircle className="h-6 w-6 text-foreground-muted" />
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user?.name || 'Vodič'}
                  </p>
                  <p className="truncate text-xs text-foreground-muted">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Odjava
              </Button>
            </>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Odjava"
              className="mx-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-primary shadow-lg sm:hidden"
      >
        <Menu className="h-5 w-5 text-primary-foreground" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform duration-200 sm:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-2 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Logo size="md" showText={false} />
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
            Vodič
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground-muted hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <UserCircle className="h-6 w-6 text-foreground-muted" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name || 'Vodič'}
              </p>
              <p className="truncate text-xs text-foreground-muted">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Odjava
          </Button>
        </div>
      </aside>
    </>
  );
}
