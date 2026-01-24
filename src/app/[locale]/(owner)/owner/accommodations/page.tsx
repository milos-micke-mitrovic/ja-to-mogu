'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Bed,
  Home,
  Pencil,
  Car,
  Wifi,
  Wind,
  ChefHat,
  Waves,
  Loader2,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useOwnerAccommodations } from '@/hooks';

export default function OwnerAccommodationsPage() {
  const t = useTranslations('ownerDashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch accommodations from API
  const { data: accommodations, isLoading, refetch } = useOwnerAccommodations();

  const filteredAccommodations = useMemo(() => {
    if (!accommodations) return [];
    return accommodations.filter((acc) => {
      const matchesSearch =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accommodations, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-success/10 text-success';
      case 'BOOKED':
        return 'bg-primary/10 text-primary';
      case 'UNAVAILABLE':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-foreground-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return t('available');
      case 'BOOKED':
        return t('occupied');
      case 'UNAVAILABLE':
        return t('maintenance');
      default:
        return status;
    }
  };

  const handleToggleStatus = async (accommodationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'AVAILABLE' ? 'BOOKED' : 'AVAILABLE';
    try {
      await fetch(`/api/owner/accommodations/${accommodationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('accommodations')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte vašim smeštajnim jedinicama
          </p>
        </div>
        <Link href="/owner/accommodations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addAccommodation')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži smeštaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="AVAILABLE">{t('available')}</SelectItem>
                <SelectItem value="BOOKED">{t('occupied')}</SelectItem>
                <SelectItem value="UNAVAILABLE">{t('maintenance')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accommodations Grid */}
      {filteredAccommodations.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">{t('noAccommodations')}</h3>
          <p className="mt-2 text-foreground-muted">{t('noAccommodationsDescription')}</p>
          <Link href="/owner/accommodations/new">
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              {t('addAccommodation')}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAccommodations.map((accommodation) => (
            <Card
              key={accommodation.id}
              className="group overflow-hidden transition-shadow hover:shadow-lg"
            >
              {/* Image Placeholder */}
              <div className="relative aspect-[4/3] bg-muted">
                <div className="flex h-full items-center justify-center">
                  <Home className="h-12 w-12 text-foreground-muted" />
                </div>
                {/* Status Badge */}
                <div
                  className={cn(
                    'absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium',
                    getStatusColor(accommodation.status)
                  )}
                >
                  {getStatusLabel(accommodation.status)}
                </div>
                {/* Actions Menu */}
                <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link href={`/owner/accommodations/${accommodation.id}/edit`}>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
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
                    {accommodation.beds} kreveta
                  </span>
                  <span className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-foreground-muted" />
                    {accommodation.rooms} soba
                  </span>
                  <span className="flex items-center gap-1">
                    <Waves className="h-4 w-4 text-foreground-muted" />
                    {accommodation.distanceToBeach}m
                  </span>
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
                  {accommodation.hasKitchen && (
                    <span className="rounded bg-muted px-2 py-1 text-xs">
                      <ChefHat className="inline h-3 w-3" /> Kuhinja
                    </span>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      {accommodation.minPricePerNight
                        ? formatPrice(accommodation.minPricePerNight)
                        : 'Po dogovoru'}
                    </span>
                    {accommodation.minPricePerNight && (
                      <span className="text-sm text-foreground-muted"> / noć</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={accommodation.status === 'AVAILABLE' ? 'outline' : 'default'}
                      onClick={() =>
                        handleToggleStatus(accommodation.id, accommodation.status)
                      }
                    >
                      {accommodation.status === 'AVAILABLE'
                        ? 'Označi zauzeto'
                        : 'Označi slobodno'}
                    </Button>
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
