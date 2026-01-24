'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Checkbox,
  Label,
} from '@/components/ui';
import {
  MapPin,
  Bed,
  Home,
  Calendar,
  Clock,
  CreditCard,
  Star,
  Check,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, getGoogleMapsUrl } from '@/lib/utils';
import { Link } from '@/i18n/routing';

// Mock accommodation - will be fetched from API
const mockAccommodation = {
  id: '1',
  name: 'Apartman Sunce',
  type: 'Apartman',
  destination: 'POLIHRONO',
  destinationLabel: 'Polihrono',
  address: 'Polihrono, Halkidiki',
  latitude: 39.9589,
  longitude: 23.7541,
  beds: 4,
  rooms: 2,
  images: ['/placeholder-accommodation.jpg'],
  pricePerNight: 4500,
  rating: 4.5,
  reviewCount: 12,
  ownerName: 'Nikos Papadopoulos',
  ownerPhone: '+30 697 123 4567',
};

export default function BookingConfirmationPage() {
  const t = useTranslations('booking');
  const searchParams = useSearchParams();
  // TODO: Use accommodationId when fetching from API
  // const accommodationId = searchParams.get('id');
  void searchParams; // Suppress unused warning until API integration

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [travelData, setTravelData] = useState<{
    arrivalDate: string;
    arrivalTime: string;
    duration: string;
    destination?: string;
  } | null>(null);

  useEffect(() => {
    // Get travel form data from session
    const travelFormData = sessionStorage.getItem('travelFormData');
    if (travelFormData) {
      setTravelData(JSON.parse(travelFormData));
    }
  }, []);

  const handleConfirmBooking = async () => {
    if (!termsAccepted) return;

    setIsConfirming(true);

    try {
      // TODO: Make API call to create booking
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear session data
      sessionStorage.removeItem('selectedPackage');
      sessionStorage.removeItem('paymentData');
      sessionStorage.removeItem('travelFormData');
      sessionStorage.removeItem('selectedAccommodation');

      setIsConfirmed(true);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Calculate total price based on duration
  const getDurationDays = (duration: string): number => {
    switch (duration) {
      case '2-3':
        return 3;
      case '4-7':
        return 7;
      case '8-10':
        return 10;
      case '10+':
        return 14;
      default:
        return 1;
    }
  };

  const durationDays = travelData ? getDurationDays(travelData.duration) : 1;
  const totalPrice = mockAccommodation.pricePerNight * durationDays;

  if (isConfirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <Check className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">{t('bookingSuccess')}</h1>
        <p className="mt-4 text-lg text-foreground-muted">{t('bookingSuccessDescription')}</p>

        <Card className="mt-8 text-left">
          <CardHeader>
            <CardTitle>{t('reservationDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <Home className="h-8 w-8 text-foreground-muted" />
              </div>
              <div>
                <h3 className="font-semibold">{mockAccommodation.name}</h3>
                <p className="text-sm text-foreground-muted">{mockAccommodation.address}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-foreground-muted">{t('ownerName')}</p>
                <p className="font-medium">{mockAccommodation.ownerName}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">{t('stayDuration')}</p>
                <p className="font-medium">{durationDays} noćenja</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">{t('destination')}</p>
                <p className="font-medium">{mockAccommodation.destinationLabel}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">{t('totalPrice')}</p>
                <p className="font-medium text-primary">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <a
              href={getGoogleMapsUrl(mockAccommodation.latitude, mockAccommodation.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <MapPin className="h-4 w-4" />
              Otvori lokaciju na mapi
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
          <CardFooter>
            <Link href="/journey" className="w-full">
              <Button size="lg" className="w-full">
                Prati status putovanja
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <p className="mt-6 text-sm text-foreground-muted">
          Detalji rezervacije su poslati na vašu email adresu.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href={`/catalog?destination=${travelData?.destination || ''}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Nazad na katalog
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-foreground">{t('confirmationTitle')}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accommodation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              {t('accommodationDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Placeholder */}
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              <div className="flex h-full items-center justify-center">
                <Home className="h-12 w-12 text-foreground-muted" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">{mockAccommodation.name}</h3>
              <p className="text-sm text-foreground-muted">{mockAccommodation.type}</p>
            </div>

            {/* Rating */}
            {mockAccommodation.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= mockAccommodation.rating
                          ? 'fill-primary text-primary'
                          : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-foreground-muted">
                  ({mockAccommodation.reviewCount} ocena)
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm">{mockAccommodation.beds} kreveta</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm">{mockAccommodation.rooms} sobe</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground-muted" />
              <div>
                <p className="text-sm">{mockAccommodation.address}</p>
                <a
                  href={getGoogleMapsUrl(mockAccommodation.latitude, mockAccommodation.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Pogledaj na mapi
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Pregled rezervacije
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Arrival Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Calendar className="h-4 w-4" />
                  {t('arrivalDay')}
                </span>
                <span className="font-medium">
                  {travelData?.arrivalDate === 'TODAY' ? 'Danas' : 'Sutra'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Clock className="h-4 w-4" />
                  {t('arrivalTime')}
                </span>
                <span className="font-medium">{travelData?.arrivalTime || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">{t('stayDuration')}</span>
                <span className="font-medium">{durationDays} noćenja</span>
              </div>
            </div>

            <hr className="border-border" />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">{t('pricePerNight')}</span>
                <span>{formatPrice(mockAccommodation.pricePerNight)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted">Broj noćenja</span>
                <span>x {durationDays}</span>
              </div>
              <hr className="border-border" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>{t('totalPrice')}</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms & Confirmation */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="mb-6 rounded-lg bg-warning-light p-4">
            <h3 className="font-medium text-warning-foreground">{t('termsTitle')}</h3>
            <p className="mt-1 text-sm text-warning-foreground/80">{t('termsDescription')}</p>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
              {t('termsAccept')}
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            size="lg"
            className="w-full"
            disabled={!termsAccepted || isConfirming}
            onClick={handleConfirmBooking}
          >
            {isConfirming ? 'Potvrđivanje...' : t('confirmFinal')}
          </Button>
          <p className="text-center text-xs text-foreground-muted">
            Nakon potvrde, podaci se šalju vlasniku smeštaja i našem timu.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
