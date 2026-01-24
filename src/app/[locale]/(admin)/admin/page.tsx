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
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Mock statistics
const mockStats = {
  totalAccommodations: 45,
  totalOwners: 28,
  totalGuides: 8,
  totalClients: 156,
  activeBookings: 23,
  pendingBookings: 5,
  completedBookings: 412,
  monthlyRevenue: 890000,
  todayArrivals: 4,
  todayDepartures: 3,
};

const mockRecentBookings = [
  {
    id: '1',
    clientName: 'Marko Petrović',
    accommodation: 'Apartman Sunce',
    status: 'CONFIRMED',
    createdAt: '2024-07-20 14:30',
  },
  {
    id: '2',
    clientName: 'Ana Jovanović',
    accommodation: 'Vila Panorama',
    status: 'PENDING',
    createdAt: '2024-07-20 12:15',
  },
  {
    id: '3',
    clientName: 'Nikola Nikolić',
    accommodation: 'Studio More',
    status: 'CONFIRMED',
    createdAt: '2024-07-19 18:45',
  },
];

export default function AdminDashboardPage() {
  const t = useTranslations('admin');

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
              <p className="text-2xl font-bold">{mockStats.totalAccommodations}</p>
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
              <p className="text-2xl font-bold">{mockStats.totalOwners}</p>
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
              <p className="text-2xl font-bold">{mockStats.totalGuides}</p>
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
              <p className="text-2xl font-bold">{mockStats.activeBookings}</p>
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
            <p className="mt-2 text-2xl font-bold">{mockStats.totalClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Na čekanju</p>
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <p className="mt-2 text-2xl font-bold text-warning">{mockStats.pendingBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Završeno ukupno</p>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-2xl font-bold text-success">{mockStats.completedBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Mesečni prihod</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatPrice(mockStats.monthlyRevenue)}
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
                    <p className="text-xl font-bold">{mockStats.todayArrivals}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="h-5 w-5 rotate-180 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-muted">Odlasci danas</p>
                    <p className="text-xl font-bold">{mockStats.todayDepartures}</p>
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
            <div className="space-y-3">
              {mockRecentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{booking.clientName}</p>
                    <p className="text-sm text-foreground-muted">{booking.accommodation}</p>
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
                    <p className="mt-1 text-xs text-foreground-muted">{booking.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
