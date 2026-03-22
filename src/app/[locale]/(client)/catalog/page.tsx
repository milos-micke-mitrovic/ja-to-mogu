'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ConfirmDialog,
} from '@/components/ui';
import {
  MapPin,
  Bed,
  Home,
  Car,
  Wifi,
  Wind,
  ChefHat,
  Waves,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { useAccommodations, useDestinations, type Accommodation } from '@/hooks';

interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  hasParking?: boolean;
  hasAC?: boolean;
  hasWifi?: boolean;
  hasKitchen?: boolean;
  hasPool?: boolean;
  hasSeaView?: boolean;
}

/** Pulsing availability indicator light */
function StatusLight({ status, label }: { status: 'available' | 'booked'; label: string }) {
  const isAvailable = status === 'available';
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'relative flex h-3.5 w-3.5 shrink-0 rounded-full',
          isAvailable ? 'bg-available' : 'bg-error'
        )}
      >
        {isAvailable && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-available opacity-50" />
        )}
      </span>
      <span className={cn('text-xs font-medium', isAvailable ? 'text-available' : 'text-error')}>
        {label}
      </span>
    </div>
  );
}

/** Guide availability indicator (third light for BONUS package) */
function GuideLight({ available }: { available: boolean }) {
  const t = useTranslations('catalog');
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'relative flex h-3.5 w-3.5 shrink-0 rounded-full',
          available ? 'bg-[#3B82F6]' : 'bg-unavailable'
        )}
      >
        {available && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3B82F6] opacity-50" />
        )}
      </span>
      <Users className={cn('h-3.5 w-3.5', available ? 'text-[#3B82F6]' : 'text-unavailable')} />
      <span className={cn('text-xs font-medium', available ? 'text-[#3B82F6]' : 'text-unavailable')}>
        {available ? t('guideAvailable') : t('guideUnavailable')}
      </span>
    </div>
  );
}

function CatalogContent() {
  const t = useTranslations('catalog');
  const tBooking = useTranslations('booking');
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get('cityId') || undefined;
  const customDestination = searchParams.get('destination') || undefined;
  const { getCityName } = useDestinations();

  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [packageType, setPackageType] = useState<string | null>(null);

  // Load package type from session
  useEffect(() => {
    const pkg = sessionStorage.getItem('selectedPackage');
    setPackageType(pkg);
  }, []);

  const isBonus = packageType === 'BONUS';

  // Build API filter params - show ALL accommodations with status indicators
  const apiFilters = useMemo(() => ({
    cityId: cityId,
    page,
    limit: 12,
    showAll: true,
    includeGuideAvailability: isBonus,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minBeds: filters.minBeds,
    hasParking: filters.hasParking,
    hasAC: filters.hasAC,
    hasWifi: filters.hasWifi,
    hasKitchen: filters.hasKitchen,
    hasPool: filters.hasPool,
    hasSeaView: filters.hasSeaView,
  }), [cityId, page, filters, isBonus]);

  // Fetch accommodations from API
  const { data, isLoading, error, refetch } = useAccommodations(apiFilters);
  const accommodations = data?.items;
  const pagination = data?.pagination;

  const destinationLabel = cityId ? getCityName(cityId) : (customDestination || '');

  const handleKreni = (accommodation: Accommodation) => {
    if (accommodation.status !== 'AVAILABLE') return;
    setSelectedAccommodation(accommodation);
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedAccommodation) return;

    setIsConfirming(true);

    try {
      // Get travel and payment data from session
      const travelFormDataStr = sessionStorage.getItem('travelFormData');
      const paymentDataStr = sessionStorage.getItem('paymentData');

      if (!travelFormDataStr || !paymentDataStr) {
        toast.error('Podaci o putovanju nisu pronađeni. Molimo popunite formu ponovo.');
        router.push('/travel-form');
        return;
      }

      const travelData = JSON.parse(travelFormDataStr);
      const packageData = JSON.parse(paymentDataStr);

      // Calculate arrival date
      const arrivalDate = travelData.arrivalDate === 'TODAY'
        ? new Date().toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Calculate total price
      const getDurationDays = (duration: string): number => {
        switch (duration) {
          case '2-3': return 3;
          case '4-7': return 7;
          case '8-10': return 10;
          case '10+': return 14;
          default: return 1;
        }
      };
      const durationDays = getDurationDays(travelData.duration);
      const pricePerNight = selectedAccommodation.minPricePerNight || 0;
      const totalPrice = pricePerNight * durationDays;

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accommodationId: selectedAccommodation.id,
          arrivalDate,
          arrivalTime: travelData.arrivalTime,
          packageType: packageData.packageType || 'BASIC',
          totalPrice,
          travelFormData: {
            name: travelData.name || '',
            email: travelData.email || '',
            phone: travelData.phone || '',
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

      toast.success(tBooking('bookingSuccess'));

      // Refresh the catalog to show updated status (green -> red)
      refetch();

      // Navigate to journey tracking
      router.push('/journey');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri kreiranju rezervacije';
      toast.error(message);
      console.error('Booking error:', err);
    } finally {
      setIsConfirming(false);
      setShowConfirmDialog(false);
    }
  };

  const updateFilters = (updater: (f: FilterState) => FilterState) => {
    setFilters(updater);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/travel-form"
          className="mb-4 inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Nazad na formu
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-foreground-muted">
          {t('subtitle', { destination: destinationLabel })}
        </p>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <StatusLight status="available" label={t('statusAvailable')} />
          <StatusLight status="booked" label={t('statusBooked')} />
          {isBonus && <GuideLight available={true} />}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters Sidebar */}
        <aside
          className={cn(
            'w-full shrink-0 lg:w-72',
            showFilters ? 'block' : 'hidden lg:block'
          )}
        >
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{t('filterTitle')}</h2>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Obriši ({activeFilterCount})
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label>{t('priceRange')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder={t('minPrice')}
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        updateFilters((f) => ({
                          ...f,
                          minPrice: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder={t('maxPrice')}
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        updateFilters((f) => ({
                          ...f,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Beds */}
                <div className="space-y-3">
                  <Label>{t('beds')}</Label>
                  <Select
                    value={filters.minBeds?.toString() || ''}
                    onValueChange={(v) =>
                      updateFilters((f) => ({ ...f, minBeds: v ? Number(v) : undefined }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bilo koji broj" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="6">6+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>{t('amenities')}</Label>
                  <div className="space-y-2">
                    {[
                      { key: 'hasParking', label: t('hasParking'), icon: Car },
                      { key: 'hasAC', label: t('hasAC'), icon: Wind },
                      { key: 'hasWifi', label: t('hasWifi'), icon: Wifi },
                      { key: 'hasKitchen', label: t('hasKitchen'), icon: ChefHat },
                      { key: 'hasPool', label: t('hasPool'), icon: Waves },
                      { key: 'hasSeaView', label: t('hasSeaView'), icon: Eye },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center gap-3">
                        <Checkbox
                          id={key}
                          checked={!!filters[key as keyof FilterState]}
                          onCheckedChange={(checked) =>
                            updateFilters((f) => ({ ...f, [key]: checked }))
                          }
                        />
                        <Label
                          htmlFor={key}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <Icon className="h-4 w-4 text-foreground-muted" />
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between lg:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('filter')}
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Accommodations Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="p-12 text-center">
              <Home className="mx-auto h-12 w-12 text-error" />
              <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
              <p className="mt-2 text-foreground-muted">{error}</p>
            </Card>
          ) : !accommodations || accommodations.length === 0 ? (
            <Card className="p-12 text-center">
              <Home className="mx-auto h-12 w-12 text-foreground-muted" />
              <h3 className="mt-4 text-lg font-medium">{t('noAccommodations')}</h3>
              <p className="mt-2 text-foreground-muted">{t('noAccommodationsDescription')}</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Obriši filtere
              </Button>
            </Card>
          ) : (
            <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {accommodations.map((accommodation: Accommodation) => {
                const isAvailable = accommodation.status === 'AVAILABLE';
                const isBookedStatus = accommodation.status === 'BOOKED';

                return (
                  <Card
                    key={accommodation.id}
                    className={cn(
                      'group overflow-hidden transition-shadow',
                      isAvailable && 'hover:shadow-lg',
                      isBookedStatus && 'opacity-75'
                    )}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-muted">
                      {accommodation.images && accommodation.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={accommodation.images[0]}
                          alt={accommodation.name}
                          className={cn(
                            'h-full w-full object-cover',
                            isBookedStatus && 'grayscale-[30%]'
                          )}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Home className="h-12 w-12 text-foreground-muted" />
                        </div>
                      )}

                      {/* Availability Indicators */}
                      <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                        <StatusLight
                          status={isAvailable ? 'available' : 'booked'}
                          label={isAvailable ? t('statusAvailable') : t('statusBooked')}
                        />
                        {isBonus && (
                          <GuideLight available={!!accommodation.hasGuideAvailable} />
                        )}
                      </div>

                      {/* Rating */}
                      {accommodation.rating && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          {accommodation.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Name & Type */}
                      <div className="mb-2">
                        <h3 className="font-semibold text-foreground">{accommodation.name}</h3>
                        <p className="text-sm text-foreground-muted">{accommodation.type}</p>
                      </div>

                      {/* Location */}
                      <div className="mb-3 flex items-center gap-1 text-sm text-foreground-muted">
                        <MapPin className="h-4 w-4" />
                        {accommodation.address}
                      </div>

                      {/* Stats */}
                      <div className="mb-4 flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4 text-foreground-muted" />
                          {t('bedsCount', { count: accommodation.beds })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Home className="h-4 w-4 text-foreground-muted" />
                          {t('rooms', { count: accommodation.rooms })}
                        </span>
                        {accommodation.distanceToBeach && (
                          <span className="flex items-center gap-1">
                            <Waves className="h-4 w-4 text-foreground-muted" />
                            {t('meters', { count: accommodation.distanceToBeach })}
                          </span>
                        )}
                      </div>

                      {/* Amenities */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {accommodation.hasParking && (
                          <span className="rounded bg-muted px-2 py-1 text-xs">
                            <Car className="inline h-3 w-3" /> Parking
                          </span>
                        )}
                        {accommodation.hasAC && (
                          <span className="rounded bg-muted px-2 py-1 text-xs">
                            <Wind className="inline h-3 w-3" /> Klima
                          </span>
                        )}
                        {accommodation.hasWifi && (
                          <span className="rounded bg-muted px-2 py-1 text-xs">
                            <Wifi className="inline h-3 w-3" /> WiFi
                          </span>
                        )}
                      </div>

                      {/* Price & KRENI Button */}
                      <div className="flex items-center justify-between border-t pt-4">
                        <div>
                          <span className="text-lg font-bold text-primary">
                            {accommodation.minPricePerNight
                              ? formatPrice(accommodation.minPricePerNight)
                              : 'Po dogovoru'}
                          </span>
                          {accommodation.minPricePerNight && (
                            <span className="text-sm text-foreground-muted"> / {t('perNight')}</span>
                          )}
                        </div>
                        {isAvailable ? (
                          <Button
                            size="sm"
                            className="gap-1 bg-available font-bold text-white hover:bg-available/90"
                            onClick={() => handleKreni(accommodation)}
                          >
                            {t('kreni')}
                          </Button>
                        ) : (
                          <span className="rounded-md bg-error/10 px-3 py-1.5 text-xs font-medium text-error">
                            {t('accommodationBooked')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-foreground-muted">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {pagination && (
              <p className="mt-2 text-center text-sm text-foreground-muted">
                {pagination.total} smeštaja ukupno
              </p>
            )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog - Final Decision Warning */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={t('finalDecisionTitle')}
        description={t('finalDecisionWarning')}
        confirmLabel={isConfirming ? t('confirmingBooking') : t('finalDecisionConfirm')}
        cancelLabel={t('finalDecisionCancel')}
        onConfirm={handleConfirmBooking}
        isLoading={isConfirming}
      />
    </div>
  );
}

function CatalogFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogContent />
    </Suspense>
  );
}
