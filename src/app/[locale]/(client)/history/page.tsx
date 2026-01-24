import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui';
import { History } from 'lucide-react';
import { HistoryBookingCard } from '@/components/reviews/HistoryBookingCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return {
    title: t('bookingHistory'),
  };
}

interface HistoryPageProps {
  params: Promise<{ locale: string }>;
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
          {bookings.map((booking) => (
            <HistoryBookingCard
              key={booking.id}
              booking={{
                id: booking.id,
                status: booking.status,
                totalPrice: booking.totalPrice,
                arrivalDate: booking.arrivalDate.toISOString(),
                duration: booking.duration,
                packageType: booking.packageType,
                accommodation: {
                  name: booking.accommodation.name,
                  address: booking.accommodation.address || '',
                },
                review: booking.review,
              }}
              translations={{
                bonusPackage: tPackages('bonusPackage'),
                basicPackage: tPackages('basicPackage'),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
