import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { Package, MapPin, CheckCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: t('dashboardTitle'),
  };
}

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const t = await getTranslations('dashboard');
  const tPackages = await getTranslations('packages');

  // TODO: Fetch user's active booking from database
  const hasActiveBooking = false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t('welcome', { name: session.user.name || '' })}
        </h1>
        <p className="mt-2 text-foreground-muted">
          {hasActiveBooking ? t('currentBooking') : t('noBookings')}
        </p>
      </div>

      {hasActiveBooking ? (
        /* Active Booking Card */
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t('currentBooking')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Display active booking details */}
            <p className="text-foreground-muted">Booking details will appear here</p>
          </CardContent>
        </Card>
      ) : (
        /* No Booking - Start Flow */
        <div className="space-y-6">
          {/* Start Journey Card */}
          <Card className="border-2 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-6 w-6 text-primary" />
                {tPackages('title')}
              </CardTitle>
              <CardDescription>
                Izaberi paket i rezerviši smeštaj za danas ili sutra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Basic Package Preview */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold">{tPackages('basicPackage')}</h3>
                  <p className="mt-1 text-2xl font-bold text-primary">{tPackages('basicPrice')}</p>
                  <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                      Elektronski katalog smeštaja
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                      Rezervacija 36h unapred
                    </li>
                  </ul>
                </div>

                {/* Bonus Package Preview */}
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                  <h3 className="font-semibold">{tPackages('bonusPackage')}</h3>
                  <p className="mt-1 text-2xl font-bold text-primary">{tPackages('bonusPrice')}</p>
                  <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                      Sve iz osnovnog paketa
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="font-medium text-foreground">Vodič na terenu</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/packages">
                  <Button size="lg" className="w-full sm:w-auto">
                    {tPackages('title')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle>Kako funkcioniše?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Izaberi paket</h4>
                    <p className="text-sm text-foreground-muted">Osnovni ili Bonus</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Popuni podatke</h4>
                    <p className="text-sm text-foreground-muted">Destinacija i termin</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Izaberi smeštaj</h4>
                    <p className="text-sm text-foreground-muted">Iz našeg kataloga</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
