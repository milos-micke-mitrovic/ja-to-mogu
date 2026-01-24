import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui';
import { History, Calendar, MapPin, Star, Package } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return {
    title: t('bookingHistory'),
  };
}

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Završeno', color: 'bg-success/10 text-success' };
    case 'CANCELLED':
      return { label: 'Otkazano', color: 'bg-error/10 text-error' };
    case 'NO_SHOW':
      return { label: 'Nije se pojavio', color: 'bg-warning/10 text-warning' };
    default:
      return { label: status, color: 'bg-muted text-foreground-muted' };
  }
}

function getDurationLabel(duration: string) {
  switch (duration) {
    case 'TWO_THREE':
      return '2-3 dana';
    case 'FOUR_SEVEN':
      return '4-7 dana';
    case 'EIGHT_TEN':
      return '8-10 dana';
    case 'TEN_PLUS':
      return '10+ dana';
    default:
      return duration;
  }
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect('/login' as Parameters<typeof redirect>[0]);
  }

  const t = await getTranslations('dashboard');
  const tPackages = await getTranslations('packages');

  // Fetch user's completed/past bookings
  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
    },
    include: {
      accommodation: {
        select: {
          name: true,
          destination: true,
          address: true,
        },
      },
      review: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: { arrivalDate: 'desc' },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('bookingHistory')}</h1>
        <p className="mt-2 text-foreground-muted">Pregled vaših prethodnih rezervacija</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">Nema prethodnih rezervacija</h3>
          <p className="mt-2 text-foreground-muted">
            Ovde će se prikazivati vaše prethodne rezervacije
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status);
            return (
              <Card key={booking.id}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{booking.accommodation.name}</h3>
                      <p className="text-sm text-foreground-muted">{booking.accommodation.address}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.arrivalDate.toISOString())}
                        </span>
                        <span>{getDurationLabel(booking.duration)}</span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {booking.packageType === 'BONUS' ? tPackages('bonusPackage') : tPackages('basicPackage')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Status Badge */}
                    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusBadge.color)}>
                      {statusBadge.label}
                    </span>

                    {/* Rating */}
                    {booking.review && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= booking.review!.rating
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
            );
          })}
        </div>
      )}
    </div>
  );
}
