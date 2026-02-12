'use client';

import { useState, useEffect, Suspense } from 'react';
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
  Loader2,
  AlertCircle,
  Building2,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice, getGoogleMapsUrl } from '@/lib/utils';
import { BANK_DETAILS } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import { useApi, useDestinations } from '@/hooks';
import type { Accommodation } from '@/hooks';

interface TravelFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;
  cityId?: string;
  hasViber?: boolean;
  hasWhatsApp?: boolean;
  // Legacy field names (in case stored with old format)
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
}

function BookingConfirmationContent() {
  const t = useTranslations('booking');
  const tPayment = useTranslations('payment');
  const searchParams = useSearchParams();
  const accommodationId = searchParams.get('id');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [travelData, setTravelData] = useState<TravelFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  // Fetch accommodation details
  const { data: accommodation, isLoading, error } = useApi<Accommodation>(
    accommodationId ? `/api/accommodations?id=${accommodationId}` : ''
  );

  useEffect(() => {
    // Get travel form data from session
    const travelFormData = sessionStorage.getItem('travelFormData');
    if (travelFormData) {
      setTravelData(JSON.parse(travelFormData));
    }
    // Get payment method from session
    const paymentDataStr = sessionStorage.getItem('paymentData');
    if (paymentDataStr) {
      const paymentDataParsed = JSON.parse(paymentDataStr);
      setPaymentMethod(paymentDataParsed.paymentMethod || null);
    }
  }, []);

  const handleConfirmBooking = async () => {
    if (!termsAccepted || !accommodation || !travelData) return;

    setIsConfirming(true);

    try {
      // Calculate arrival date
      const arrivalDate = travelData.arrivalDate === 'TODAY'
        ? new Date().toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Get package data from session
      const paymentDataStr = sessionStorage.getItem('paymentData');
      const packageData = paymentDataStr ? JSON.parse(paymentDataStr) : { packageType: 'BASIC' };

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accommodationId: accommodation.id,
          arrivalDate,
          arrivalTime: travelData.arrivalTime,
          packageType: packageData.packageType || 'BASIC',
          totalPrice,
          travelFormData: {
            name: travelData.guestName || travelData.name || '',
            email: travelData.guestEmail || travelData.email || '',
            phone: travelData.guestPhone || travelData.phone || '',
            address: travelData.address || '',
            duration: travelData.duration,
            hasViber: travelData.hasViber || false,
            hasWhatsApp: travelData.hasWhatsApp || false,
          },
          paymentData: {
            paymentMethod: packageData.paymentMethod || 'cash',
            name: packageData.name,
            email: packageData.email,
            phone: packageData.phone,
            paidAt: packageData.paidAt,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Greška pri kreiranju rezervacije');
      }

      // Clear session data
      sessionStorage.removeItem('selectedPackage');
      sessionStorage.removeItem('paymentData');
      sessionStorage.removeItem('travelFormData');
      sessionStorage.removeItem('selectedAccommodation');

      setIsConfirmed(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri kreiranju rezervacije';
      toast.error(message);
      console.error('Booking error:', err);
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
  const pricePerNight = accommodation?.minPricePerNight || 0;
  const totalPrice = pricePerNight * durationDays;

  const { getCityName } = useDestinations();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-error" />
        <h2 className="mt-4 text-xl font-bold">Smeštaj nije pronađen</h2>
        <p className="mt-2 text-foreground-muted">
          {error || 'Molimo izaberite smeštaj iz kataloga.'}
        </p>
        <Link href="/catalog">
          <Button className="mt-4">Nazad na katalog</Button>
        </Link>
      </div>
    );
  }

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
                <h3 className="font-semibold">{accommodation.name}</h3>
                <p className="text-sm text-foreground-muted">{accommodation.address}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {accommodation.owner && (
                <div>
                  <p className="text-sm text-foreground-muted">{t('ownerName')}</p>
                  <p className="font-medium">{accommodation.owner.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-foreground-muted">{t('stayDuration')}</p>
                <p className="font-medium">{durationDays} noćenja</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">{t('destination')}</p>
                <p className="font-medium">{accommodation.city?.name || getCityName(accommodation.cityId)}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">{t('totalPrice')}</p>
                <p className="font-medium text-primary">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <a
              href={getGoogleMapsUrl(accommodation.latitude, accommodation.longitude)}
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

        {/* Payment Instructions */}
        {paymentMethod === 'bank_transfer' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" />
                {tPayment('bankDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">{tPayment('receiver')}:</span>
                <span className="font-medium">{BANK_DETAILS.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{tPayment('bankName')}:</span>
                <span className="font-medium">{BANK_DETAILS.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{tPayment('accountNumber')}:</span>
                <span className="font-medium">{BANK_DETAILS.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{tPayment('model')}:</span>
                <span className="font-medium">{BANK_DETAILS.model}</span>
              </div>
              <div className="mt-4 rounded-lg bg-warning-light p-3">
                <p className="text-sm text-warning-foreground">
                  {tPayment('bankTransferInstructions')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentMethod === 'cash' && (
          <Card className="mt-6">
            <CardContent className="flex items-start gap-3 pt-6">
              <Banknote className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-sm text-foreground-muted">
                {tPayment('cashInstructions')}
              </p>
            </CardContent>
          </Card>
        )}

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
        href={`/catalog?cityId=${travelData?.cityId || ''}`}
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
              <h3 className="text-lg font-semibold">{accommodation.name}</h3>
              <p className="text-sm text-foreground-muted">{accommodation.type}</p>
            </div>

            {/* Rating */}
            {accommodation.rating != null && accommodation.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= (accommodation.rating || 0)
                          ? 'fill-primary text-primary'
                          : 'text-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-foreground-muted">
                  ({accommodation.reviewCount || 0} ocena)
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm">{accommodation.beds} kreveta</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm">{accommodation.rooms} sobe</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground-muted" />
              <div>
                <p className="text-sm">{accommodation.address}</p>
                <a
                  href={getGoogleMapsUrl(accommodation.latitude, accommodation.longitude)}
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
                <span>{formatPrice(pricePerNight)}</span>
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

function BookingConfirmationFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<BookingConfirmationFallback />}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
