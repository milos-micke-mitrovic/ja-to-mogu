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

interface UserStats {
  total: number;
  owners: number;
  guides: number;
  clients: number;
}

interface BookingStats {
  active: number;
  pending: number;
  completed: number;
  todayArrivals: number;
  monthlyRevenue: number;
}

interface AdminBooking {
  id: string;
  guestName: string;
  status: string;
  createdAt: string;
  accommodation: {
    name: string;
  };
}

interface AccommodationStats {
  total: number;
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin');

  // Fetch admin stats from API
  const { data: users, isLoading: loadingUsers } = useApi<{ users: { role: string }[]; total: number }>('/api/admin/users?limit=1000');
  const { data: accommodations, isLoading: loadingAccommodations } = useApi<{ accommodations: unknown[]; total: number }>('/api/admin/accommodations?limit=1');
  const { data: bookings, isLoading: loadingBookings } = useApi<{ bookings: AdminBooking[]; total: number }>('/api/admin/bookings?limit=5');

  // Calculate stats from fetched data
  const userStats: UserStats = {
    total: users?.total || 0,
    owners: users?.users?.filter((u) => u.role === 'OWNER').length || 0,
    guides: users?.users?.filter((u) => u.role === 'GUIDE').length || 0,
    clients: users?.users?.filter((u) => u.role === 'CLIENT').length || 0,
  };

  const bookingStats: BookingStats = {
    active: bookings?.bookings?.filter((b) => b.status === 'CONFIRMED').length || 0,
    pending: bookings?.bookings?.filter((b) => b.status === 'PENDING').length || 0,
    completed: bookings?.bookings?.filter((b) => b.status === 'COMPLETED').length || 0,
    todayArrivals: 0, // Would need specific API call
    monthlyRevenue: 0, // Would need specific API call
  };

  const accommodationStats: AccommodationStats = {
    total: accommodations?.total || 0,
  };

  const recentBookings = bookings?.bookings || [];
  const isLoading = loadingUsers || loadingAccommodations || loadingBookings;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('dashboard')}</h1>
        <p className="mt-2 text-foreground-muted">Pregled celokupnog sistema</p>
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
              <p className="text-2xl font-bold">{accommodationStats.total}</p>
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
              <p className="text-2xl font-bold">{userStats.owners}</p>
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
              <p className="text-2xl font-bold">{userStats.guides}</p>
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
              <p className="text-2xl font-bold">{bookingStats.active}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Ukupno klijenata</p>
              <Users className="h-4 w-4 text-foreground-muted" />
            </div>
            <p className="mt-2 text-2xl font-bold">{userStats.clients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Na čekanju</p>
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <p className="mt-2 text-2xl font-bold text-warning">{bookingStats.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Završeno ukupno</p>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-2xl font-bold text-success">{bookingStats.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Mesečni prihod</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatPrice(bookingStats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Današnja aktivnost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Dolasci danas</p>
                    <p className="text-xl font-bold">{bookingStats.todayArrivals}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-5 w-5 rotate-180 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Ukupno korisnika</p>
                    <p className="text-xl font-bold">{userStats.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Poslednje rezervacije</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-foreground-muted" />
                <p className="mt-4 text-foreground-muted">Nema rezervacija</p>
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
                        {booking.status === 'CONFIRMED' ? 'Potvrđeno' : 'Na čekanju'}
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
