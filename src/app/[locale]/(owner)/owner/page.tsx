'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import {
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  MapPin,
  User,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with API calls
const mockStats = {
  totalAccommodations: 3,
  activeBookings: 2,
  pendingArrivals: 1,
  monthlyEarnings: 45000,
};

const mockBookings = [
  {
    id: '1',
    guestName: 'Marko Petrović',
    accommodationName: 'Apartman Sunce',
    checkIn: '2024-07-20',
    checkOut: '2024-07-27',
    status: 'CONFIRMED',
    totalAmount: 31500,
  },
  {
    id: '2',
    guestName: 'Ana Jovanović',
    accommodationName: 'Vila Panorama',
    checkIn: '2024-07-22',
    checkOut: '2024-07-29',
    status: 'PENDING',
    totalAmount: 56000,
  },
];

const mockAccommodations = [
  {
    id: '1',
    name: 'Apartman Sunce',
    type: 'Apartman',
    location: 'Polihrono',
    status: 'AVAILABLE',
    pricePerNight: 4500,
  },
  {
    id: '2',
    name: 'Vila Panorama',
    type: 'Vila',
    location: 'Polihrono',
    status: 'OCCUPIED',
    pricePerNight: 8000,
  },
  {
    id: '3',
    name: 'Studio More',
    type: 'Studio',
    location: 'Polihrono',
    status: 'AVAILABLE',
    pricePerNight: 2500,
  },
];

export default function OwnerDashboardPage() {
  const t = useTranslations('ownerDashboard');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-success/10 text-success';
      case 'OCCUPIED':
        return 'bg-primary/10 text-primary';
      case 'MAINTENANCE':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-foreground-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return t('available');
      case 'OCCUPIED':
        return t('occupied');
      case 'MAINTENANCE':
        return t('maintenance');
      default:
        return status;
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning/10 text-warning';
      case 'CONFIRMED':
        return 'bg-success/10 text-success';
      case 'CHECKED_IN':
        return 'bg-primary/10 text-primary';
      case 'COMPLETED':
        return 'bg-muted text-foreground-muted';
      case 'CANCELLED':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-foreground-muted';
    }
  };

  const getBookingStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('pending');
      case 'CONFIRMED':
        return t('confirmed');
      case 'CHECKED_IN':
        return t('checkedIn');
      case 'COMPLETED':
        return t('completed');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('dashboard')}</h1>
        <p className="mt-2 text-foreground-muted">{t('welcomeBack')}</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('totalAccommodations')}</p>
              <p className="text-2xl font-bold">{mockStats.totalAccommodations}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('activeBookings')}</p>
              <p className="text-2xl font-bold">{mockStats.activeBookings}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('pendingArrivals')}</p>
              <p className="text-2xl font-bold">{mockStats.pendingArrivals}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('monthlyEarnings')}</p>
              <p className="text-2xl font-bold">{formatPrice(mockStats.monthlyEarnings)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('recentBookings')}</CardTitle>
              <Link href="/owner/bookings">
                <Button variant="ghost" size="sm" className="gap-2">
                  {t('viewAllBookings')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {mockBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-foreground-muted" />
                  <p className="mt-4 text-foreground-muted">{t('noBookings')}</p>
                  <p className="text-sm text-foreground-muted">{t('noBookingsDescription')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-foreground-muted" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-foreground-muted">
                            {booking.accommodationName}
                          </p>
                          <p className="mt-1 text-sm text-foreground-muted">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            getBookingStatusColor(booking.status)
                          )}
                        >
                          {getBookingStatusLabel(booking.status)}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatPrice(booking.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Accommodations Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/owner/accommodations/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  {t('addAccommodation')}
                </Button>
              </Link>
              <Link href="/owner/accommodations" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4" />
                  {t('manageAvailability')}
                </Button>
              </Link>
              <Link href="/owner/statistics" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('viewStatistics')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Accommodations Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('accommodations')}</CardTitle>
              <Link href="/owner/accommodations">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {mockAccommodations.length === 0 ? (
                <div className="py-4 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-foreground-muted" />
                  <p className="mt-2 text-sm text-foreground-muted">{t('noAccommodations')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockAccommodations.map((accommodation) => (
                    <div
                      key={accommodation.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{accommodation.name}</p>
                        <p className="flex items-center gap-1 text-xs text-foreground-muted">
                          <MapPin className="h-3 w-3" />
                          {accommodation.location}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          getStatusColor(accommodation.status)
                        )}
                      >
                        {getStatusLabel(accommodation.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
