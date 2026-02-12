'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Users,
  Building2,
  Calendar,
  Compass,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useApi } from '@/hooks';

interface AdminStats {
  users: { owners: number; guides: number; clients: number; total: number };
  accommodations: number;
  bookings: { active: number; pending: number; completed: number; cancelled: number };
  todayArrivals: number;
  monthlyRevenue: number;
  recentBookings: {
    id: string;
    guestName: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    accommodation: { name: string };
  }[];
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin');

  const { data: stats, isLoading } = useApi<AdminStats>('/api/admin/stats');

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const users = stats?.users ?? { owners: 0, guides: 0, clients: 0, total: 0 };
  const accommodations = stats?.accommodations ?? 0;
  const bookings = stats?.bookings ?? { active: 0, pending: 0, completed: 0, cancelled: 0 };
  const todayArrivals = stats?.todayArrivals ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const recentBookings = stats?.recentBookings ?? [];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('dashboard')}</h1>
        <p className="mt-2 text-foreground-muted">{t('systemOverview')}</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('accommodations')}</p>
              <p className="text-2xl font-bold">{accommodations}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('owners')}</p>
              <p className="text-2xl font-bold">{users.owners}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Compass className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('guides')}</p>
              <p className="text-2xl font-bold">{users.guides}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('bookings')}</p>
              <p className="text-2xl font-bold">{bookings.active}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">{t('totalClients')}</p>
              <Users className="h-4 w-4 text-foreground-muted" />
            </div>
            <p className="mt-2 text-2xl font-bold">{users.clients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">{t('pendingCount')}</p>
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <p className="mt-2 text-2xl font-bold text-warning">{bookings.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">{t('completedTotal')}</p>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-2xl font-bold text-success">{bookings.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">{t('monthlyRevenue')}</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatPrice(monthlyRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('todayActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">{t('todayArrivals')}</p>
                    <p className="text-xl font-bold">{todayArrivals}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-5 w-5 rotate-180 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">{t('totalUsers')}</p>
                    <p className="text-xl font-bold">{users.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentBookings')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-foreground-muted" />
                <p className="mt-4 text-foreground-muted">{t('noBookings')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-sm text-foreground-muted">{booking.accommodation?.name}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {booking.status === 'CONFIRMED' ? t('statusConfirmed') : t('statusPending')}
                      </span>
                      <p className="mt-1 text-xs text-foreground-muted">{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
