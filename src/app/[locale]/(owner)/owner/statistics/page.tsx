'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Mock statistics data
const mockStats = {
  totalEarnings: 345000,
  monthlyEarnings: 45000,
  lastMonthEarnings: 52000,
  yearlyEarnings: 345000,
  occupancyRate: 78,
  averageRating: 4.6,
  totalReviews: 45,
  totalBookings: 32,
  completedBookings: 28,
  cancelledBookings: 2,
};

const mockMonthlyData = [
  { month: 'Jan', earnings: 0, bookings: 0 },
  { month: 'Feb', earnings: 0, bookings: 0 },
  { month: 'Mar', earnings: 0, bookings: 0 },
  { month: 'Apr', earnings: 15000, bookings: 2 },
  { month: 'Maj', earnings: 35000, bookings: 5 },
  { month: 'Jun', earnings: 78000, bookings: 8 },
  { month: 'Jul', earnings: 120000, bookings: 12 },
  { month: 'Avg', earnings: 97000, bookings: 10 },
  { month: 'Sep', earnings: 0, bookings: 0 },
  { month: 'Okt', earnings: 0, bookings: 0 },
  { month: 'Nov', earnings: 0, bookings: 0 },
  { month: 'Dec', earnings: 0, bookings: 0 },
];

const mockAccommodationStats = [
  {
    id: '1',
    name: 'Apartman Sunce',
    earnings: 156000,
    bookings: 18,
    occupancyRate: 85,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Vila Panorama',
    earnings: 168000,
    bookings: 12,
    occupancyRate: 72,
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Studio More',
    earnings: 21000,
    bookings: 7,
    occupancyRate: 65,
    rating: 4.3,
  },
];

export default function OwnerStatisticsPage() {
  const t = useTranslations('ownerDashboard');
  const [timePeriod, setTimePeriod] = useState('thisYear');

  const maxEarnings = Math.max(...mockMonthlyData.map((d) => d.earnings));

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
              <p className="text-2xl font-bold">{formatPrice(mockStats.totalEarnings)}</p>
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
              <p className="text-2xl font-bold">{formatPrice(mockStats.monthlyEarnings)}</p>
              <p className="text-xs text-foreground-muted">
                Prošli mesec: {formatPrice(mockStats.lastMonthEarnings)}
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
              <p className="text-sm text-foreground-muted">{t('occupancyRate')}</p>
              <p className="text-2xl font-bold">{mockStats.occupancyRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('averageRating')}</p>
              <p className="text-2xl font-bold">{mockStats.averageRating}</p>
              <p className="text-xs text-foreground-muted">{mockStats.totalReviews} ocena</p>
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
              {mockMonthlyData.map((data) => (
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
            <div className="space-y-4">
              {mockAccommodationStats.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">{acc.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-foreground-muted">
                      <span>{acc.bookings} rezervacija</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        {acc.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatPrice(acc.earnings)}</p>
                    <p className="text-sm text-foreground-muted">{acc.occupancyRate}% zauzetost</p>
                  </div>
                </div>
              ))}
            </div>
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
                <span className="font-semibold">{mockStats.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Završene</span>
                <span className="font-semibold text-success">{mockStats.completedBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Otkazane</span>
                <span className="font-semibold text-error">{mockStats.cancelledBookings}</span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Stopa završetka</span>
                  <span className="font-semibold">
                    {Math.round(
                      (mockStats.completedBookings / mockStats.totalBookings) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
