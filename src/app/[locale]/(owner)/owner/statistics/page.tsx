'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  TrendingUp,
  Calendar,
  Star,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useApi, useOwnerAccommodations } from '@/hooks';

interface OwnerBooking {
  id: string;
  status: string;
  totalPrice: number;
  arrivalDate: string;
  accommodation: {
    id: string;
    name: string;
  };
}

export default function OwnerStatisticsPage() {
  const t = useTranslations('ownerDashboard');
  const [timePeriod, setTimePeriod] = useState('thisYear');

  // Fetch data
  const { data: accommodations, isLoading: loadingAccommodations } = useOwnerAccommodations();
  const { data: bookings, isLoading: loadingBookings } = useApi<OwnerBooking[]>('/api/owner/bookings');

  const isLoading = loadingAccommodations || loadingBookings;

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!bookings) return {
      totalEarnings: 0,
      monthlyEarnings: 0,
      lastMonthEarnings: 0,
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
    };

    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

    const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');

    const totalEarnings = [...completedBookings, ...confirmedBookings]
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const monthlyEarnings = [...completedBookings, ...confirmedBookings]
      .filter((b) => new Date(b.arrivalDate).getMonth() === thisMonth)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const lastMonthEarnings = [...completedBookings, ...confirmedBookings]
      .filter((b) => new Date(b.arrivalDate).getMonth() === lastMonth)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      totalEarnings,
      monthlyEarnings,
      lastMonthEarnings,
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      cancelledBookings: cancelledBookings.length,
    };
  }, [bookings]);

  // Calculate monthly data for chart
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
    const data = months.map((month) => ({ month, earnings: 0, bookings: 0 }));

    if (bookings) {
      bookings.forEach((booking) => {
        if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
          const monthIndex = new Date(booking.arrivalDate).getMonth();
          const monthData = data[monthIndex];
          if (monthData) {
            monthData.earnings += booking.totalPrice;
            monthData.bookings += 1;
          }
        }
      });
    }

    return data;
  }, [bookings]);

  // Calculate accommodation stats
  const accommodationStats = useMemo(() => {
    if (!accommodations || !bookings) return [];

    return accommodations.map((acc) => {
      const accBookings = bookings.filter((b) => b.accommodation.id === acc.id);
      const completedOrConfirmed = accBookings.filter(
        (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
      );
      const earnings = completedOrConfirmed.reduce((sum, b) => sum + b.totalPrice, 0);

      return {
        id: acc.id,
        name: acc.name,
        earnings,
        bookings: accBookings.length,
        rating: acc.rating || 0,
      };
    });
  }, [accommodations, bookings]);

  const maxEarnings = Math.max(...monthlyData.map((d) => d.earnings), 1);

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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('statistics')}</h1>
          <p className="mt-2 text-foreground-muted">
            Pratite zaradu i performanse vaših smeštaja
          </p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisMonth">{t('thisMonth')}</SelectItem>
            <SelectItem value="lastMonth">{t('lastMonth')}</SelectItem>
            <SelectItem value="thisYear">{t('thisYear')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('totalEarnings')}</p>
              <p className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('thisMonth')}</p>
              <p className="text-2xl font-bold">{formatPrice(stats.monthlyEarnings)}</p>
              <p className="text-xs text-foreground-muted">
                Prošli mesec: {formatPrice(stats.lastMonthEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('totalBookings')}</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('accommodations')}</p>
              <p className="text-2xl font-bold">{accommodations?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Earnings Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mesečna zarada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-2">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-primary transition-all hover:bg-primary-hover"
                    style={{
                      height: maxEarnings > 0 ? `${(data.earnings / maxEarnings) * 100}%` : '0%',
                      minHeight: data.earnings > 0 ? '4px' : '0',
                    }}
                  />
                  <span className="text-xs text-foreground-muted">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accommodation Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performanse po smeštaju</CardTitle>
          </CardHeader>
          <CardContent>
            {accommodationStats.length === 0 ? (
              <p className="text-center text-foreground-muted py-4">Nema podataka o smeštajima</p>
            ) : (
              <div className="space-y-4">
                {accommodationStats.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium">{acc.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm text-foreground-muted">
                        <span>{acc.bookings} rezervacija</span>
                        {acc.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            {acc.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatPrice(acc.earnings)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistika rezervacija</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Ukupno rezervacija</span>
                <span className="font-semibold">{stats.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Završene</span>
                <span className="font-semibold text-success">{stats.completedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Otkazane</span>
                <span className="font-semibold text-error">{stats.cancelledBookings}</span>
              </div>
              {stats.totalBookings > 0 && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Stopa završetka</span>
                    <span className="font-semibold">
                      {Math.round((stats.completedBookings / stats.totalBookings) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
