'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { Button, Logo } from '@/components/ui';
import {
  Home,
  Building2,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OwnerHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function OwnerHeader({ user }: OwnerHeaderProps) {
  const t = useTranslations('ownerDashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/owner', icon: Home, label: t('dashboard') },
    { href: '/owner/accommodations', icon: Building2, label: t('accommodations') },
    { href: '/owner/bookings', icon: Calendar, label: t('bookings') },
    { href: '/owner/statistics', icon: BarChart3, label: t('statistics') },
    { href: '/owner/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size="md" />
            <span className="hidden rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:inline">
              Vlasnik
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-foreground-muted" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">{user?.name || 'Vlasnik'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden gap-2 md:flex"
            >
              <LogOut className="h-4 w-4" />
              Odjava
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-foreground-muted hover:bg-muted md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'border-t border-border bg-background md:hidden',
          isMobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <nav className="space-y-1 px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            Odjava
          </button>
        </nav>
      </div>
    </header>
  );
}
