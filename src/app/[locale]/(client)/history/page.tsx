import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui';
import { History, Calendar, MapPin, Star } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return {
    title: t('bookingHistory'),
  };
}

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
}

// Mock booking history - will be fetched from API
const mockHistory = [
  {
    id: '1',
    accommodationName: 'Apartman Sunce',
    destination: 'Polihrono',
    arrivalDate: '2024-07-15',
    duration: '7 dana',
    totalPrice: 31500,
    status: 'COMPLETED',
    rating: 5,
  },
  {
    id: '2',
    accommodationName: 'Vila Panorama',
    destination: 'Nikiti',
    arrivalDate: '2023-08-20',
    duration: '10 dana',
    totalPrice: 80000,
    status: 'COMPLETED',
    rating: 4,
  },
];

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('dashboard');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('bookingHistory')}</h1>
        <p className="mt-2 text-foreground-muted">Pregled vaših prethodnih rezervacija</p>
      </div>

      {mockHistory.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">Nema prethodnih rezervacija</h3>
          <p className="mt-2 text-foreground-muted">
            Ovde će se prikazivati vaše prethodne rezervacije
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockHistory.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{booking.accommodationName}</h3>
                    <p className="text-sm text-foreground-muted">{booking.destination}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.arrivalDate)}
                      </span>
                      <span>{booking.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Rating */}
                  {booking.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= booking.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatPrice(booking.totalPrice)}
                    </p>
                    <p className="text-xs text-foreground-muted">Ukupno</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
