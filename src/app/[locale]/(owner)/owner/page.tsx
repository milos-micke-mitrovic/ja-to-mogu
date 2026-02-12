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
  Loader2,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useApi, useOwnerAccommodations } from '@/hooks';

interface OwnerBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  arrivalDate: string;
  duration: string;
  status: string;
  totalPrice: number;
  journeyStatus: string;
  accommodation: {
    id: string;
    name: string;
    city?: { name: string };
    address: string;
  };
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function OwnerDashboardPage() {
  const t = useTranslations('ownerDashboard');

  // Fetch owner's accommodations
  const { data: accommodations, isLoading: loadingAccommodations } = useOwnerAccommodations();

  // Fetch owner's bookings
  const { data: bookings, isLoading: loadingBookings } = useApi<OwnerBooking[]>('/api/owner/bookings');

  // Calculate stats
  const stats = {
    totalAccommodations: accommodations?.length || 0,
    activeBookings: bookings?.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length || 0,
    pendingArrivals: bookings?.filter((b) => b.status === 'CONFIRMED' && b.journeyStatus === 'NOT_STARTED').length || 0,
    monthlyEarnings: bookings
      ?.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalPrice, 0) || 0,
  };

  const recentBookings = bookings?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-success/10 text-success';
      case 'BOOKED':
        return 'bg-primary/10 text-primary';
      case 'UNAVAILABLE':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-foreground-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return t('available');
      case 'BOOKED':
        return t('occupied');
      case 'UNAVAILABLE':
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
      case 'COMPLETED':
        return t('completed');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  const isLoading = loadingAccommodations || loadingBookings;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <p className="text-2xl font-bold">{stats.totalAccommodations}</p>
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
              <p className="text-2xl font-bold">{stats.activeBookings}</p>
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
              <p className="text-2xl font-bold">{stats.pendingArrivals}</p>
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
              <p className="text-2xl font-bold">{formatPrice(stats.monthlyEarnings)}</p>
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
              {recentBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-foreground-muted" />
                  <p className="mt-4 text-foreground-muted">{t('noBookings')}</p>
                  <p className="text-sm text-foreground-muted">{t('noBookingsDescription')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
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
                            {booking.accommodation.name}
                          </p>
                          <p className="mt-1 text-sm text-foreground-muted">
                            {formatDate(booking.arrivalDate)}
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
                          {formatPrice(booking.totalPrice)}
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
              {!accommodations || accommodations.length === 0 ? (
                <div className="py-4 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-foreground-muted" />
                  <p className="mt-2 text-sm text-foreground-muted">{t('noAccommodations')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accommodations.slice(0, 5).map((accommodation) => (
                    <div
                      key={accommodation.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{accommodation.name}</p>
                        <p className="flex items-center gap-1 text-xs text-foreground-muted">
                          <MapPin className="h-3 w-3" />
                          {accommodation.address}
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
