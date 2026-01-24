'use client';

import { useState } from 'react';
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
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { ALL_DESTINATIONS } from '@/lib/constants';
import { Link } from '@/i18n/routing';

// Mock accommodation data - will be replaced with API call
const mockAccommodations = [
  {
    id: '1',
    name: 'Apartman Sunce',
    type: 'Apartman',
    destination: 'POLIHRONO',
    address: 'Polihrono, Halkidiki',
    latitude: 39.9589,
    longitude: 23.7541,
    beds: 4,
    rooms: 2,
    hasParking: true,
    hasAC: true,
    hasWifi: true,
    hasKitchen: true,
    hasPool: false,
    hasSeaView: true,
    distanceToBeach: 150,
    images: ['/placeholder-accommodation.jpg'],
    pricePerNight: 4500,
    rating: 4.5,
    reviewCount: 12,
    status: 'AVAILABLE',
  },
  {
    id: '2',
    name: 'Vila Panorama',
    type: 'Vila',
    destination: 'POLIHRONO',
    address: 'Polihrono, Halkidiki',
    latitude: 39.9601,
    longitude: 23.7555,
    beds: 6,
    rooms: 3,
    hasParking: true,
    hasAC: true,
    hasWifi: true,
    hasKitchen: true,
    hasPool: true,
    hasSeaView: true,
    distanceToBeach: 300,
    images: ['/placeholder-accommodation.jpg'],
    pricePerNight: 8000,
    rating: 4.8,
    reviewCount: 8,
    status: 'AVAILABLE',
  },
  {
    id: '3',
    name: 'Studio More',
    type: 'Studio',
    destination: 'POLIHRONO',
    address: 'Polihrono, Halkidiki',
    latitude: 39.9575,
    longitude: 23.7530,
    beds: 2,
    rooms: 1,
    hasParking: false,
    hasAC: true,
    hasWifi: true,
    hasKitchen: false,
    hasPool: false,
    hasSeaView: false,
    distanceToBeach: 50,
    images: ['/placeholder-accommodation.jpg'],
    pricePerNight: 2500,
    rating: 4.2,
    reviewCount: 25,
    status: 'AVAILABLE',
  },
];

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

export default function CatalogPage() {
  const t = useTranslations('catalog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination');

  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);

  const destinationLabel =
    ALL_DESTINATIONS.find((d) => d.value === destination)?.label || destination || '';

  // Filter accommodations
  const filterAccommodations = () => {
    let filtered = mockAccommodations;

    if (destination) {
      filtered = filtered.filter((a) => a.destination === destination);
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((a) => a.pricePerNight >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((a) => a.pricePerNight <= filters.maxPrice!);
    }
    if (filters.minBeds !== undefined) {
      filtered = filtered.filter((a) => a.beds >= filters.minBeds!);
    }
    if (filters.hasParking) {
      filtered = filtered.filter((a) => a.hasParking);
    }
    if (filters.hasAC) {
      filtered = filtered.filter((a) => a.hasAC);
    }
    if (filters.hasWifi) {
      filtered = filtered.filter((a) => a.hasWifi);
    }
    if (filters.hasKitchen) {
      filtered = filtered.filter((a) => a.hasKitchen);
    }
    if (filters.hasPool) {
      filtered = filtered.filter((a) => a.hasPool);
    }
    if (filters.hasSeaView) {
      filtered = filtered.filter((a) => a.hasSeaView);
    }

    return filtered;
  };

  const accommodations = filterAccommodations();

  const handleSelectAccommodation = (accommodationId: string) => {
    sessionStorage.setItem('selectedAccommodation', accommodationId);
    router.push(`/booking-confirmation?id=${accommodationId}`);
  };

  const clearFilters = () => {
    setFilters({});
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
                        setFilters((f) => ({
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
                        setFilters((f) => ({
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
                      setFilters((f) => ({ ...f, minBeds: v ? Number(v) : undefined }))
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
                            setFilters((f) => ({ ...f, [key]: checked }))
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
          {accommodations.length === 0 ? (
            <Card className="p-12 text-center">
              <Home className="mx-auto h-12 w-12 text-foreground-muted" />
              <h3 className="mt-4 text-lg font-medium">{t('noAccommodations')}</h3>
              <p className="mt-2 text-foreground-muted">{t('noAccommodationsDescription')}</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Obriši filtere
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {accommodations.map((accommodation) => (
                <Card
                  key={accommodation.id}
                  className="group overflow-hidden transition-shadow hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <Home className="h-12 w-12 text-foreground-muted" />
                    </div>
                    {/* Status Badge */}
                    <div className="absolute left-3 top-3 rounded-full bg-available px-3 py-1 text-xs font-medium text-white">
                      {t('available')}
                    </div>
                    {/* Rating */}
                    {accommodation.rating && (
                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        {accommodation.rating}
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

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(accommodation.pricePerNight)}
                        </span>
                        <span className="text-sm text-foreground-muted"> / {t('perNight')}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectAccommodation(accommodation.id)}
                      >
                        {t('confirmAccommodation')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
