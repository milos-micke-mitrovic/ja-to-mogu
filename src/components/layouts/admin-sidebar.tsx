'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { Button, Logo } from '@/components/ui';
import {
  LayoutDashboard,
  Building2,
  Users,
  Compass,
  Calendar,
  CreditCard,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations('admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/admin/accommodations', icon: Building2, label: t('accommodations') },
    { href: '/admin/owners', icon: Users, label: t('owners') },
    { href: '/admin/guides', icon: Compass, label: t('guides') },
    { href: '/admin/bookings', icon: Calendar, label: t('bookings') },
    { href: '/admin/payments', icon: CreditCard, label: t('payments') },
    { href: '/admin/clients', icon: UserCircle, label: t('clients') },
    { href: '/admin/settings', icon: Settings, label: t('settings') },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Logo size="md" />
        <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <UserCircle className="h-6 w-6 text-foreground-muted" />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-foreground">{user?.name || 'Admin'}</p>
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
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
            Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-foreground-muted hover:bg-muted"
          aria-label={isMobileMenuOpen ? 'Zatvori meni' : 'Otvori meni'}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile content padding */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
