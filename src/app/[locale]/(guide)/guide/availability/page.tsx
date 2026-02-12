'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Checkbox,
  Label,
} from '@/components/ui';
import { MapPin, Check, X, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi, useDestinations } from '@/hooks';
import { toast } from 'sonner';

interface GuideAvailability {
  id: string;
  cityId: string;
  isActive: boolean;
  availableFrom: string;
  availableTo: string;
}

export default function GuideAvailabilityPage() {
  const t = useTranslations('guideDashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const { countries, getCityName } = useDestinations();

  // Fetch existing availability
  const { data: availabilities, isLoading, refetch } = useApi<GuideAvailability[]>('/api/guide/availability');

  // Initialize selected locations from fetched data
  useEffect(() => {
    if (availabilities && availabilities.length > 0) {
      const activeLocations = availabilities
        .filter((a) => a.isActive)
        .map((a) => a.cityId);
      setSelectedLocations(activeLocations);
      setIsAvailable(activeLocations.length > 0);
    }
  }, [availabilities]);

  const handleLocationToggle = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Create/update availability for each selected location
      const availableFrom = new Date().toISOString();
      const availableTo = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days from now

      // First, update existing ones to inactive if not selected
      if (availabilities) {
        for (const avail of availabilities) {
          const shouldBeActive = selectedLocations.includes(avail.cityId) && isAvailable;
          if (avail.isActive !== shouldBeActive) {
            await fetch('/api/guide/availability', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: avail.id, isActive: shouldBeActive }),
            });
          }
        }
      }

      // Then, create new entries for locations not yet in the database
      const existingCityIds = availabilities?.map((a) => a.cityId) || [];
      for (const cityId of selectedLocations) {
        if (!existingCityIds.includes(cityId)) {
          await fetch('/api/guide/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cityId,
              availableFrom,
              availableTo,
              isActive: isAvailable,
            }),
          });
        }
      }

      refetch();
      toast.success(t('availabilitySaved'));
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(t('availabilitySaveError'));
    } finally {
      setIsSaving(false);
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('availability')}</h1>
        <p className="mt-2 text-foreground-muted">{t('availabilityDescription')}</p>
      </div>

      {/* Availability Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('availabilityStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  isAvailable ? 'bg-success/10' : 'bg-error/10'
                )}
              >
                {isAvailable ? (
                  <Check className="h-6 w-6 text-success" />
                ) : (
                  <X className="h-6 w-6 text-error" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {isAvailable ? t('availableForWork') : t('notAvailableForWork')}
                </p>
                <p className="text-sm text-foreground-muted">
                  {isAvailable
                    ? t('canReceiveClients')
                    : t('noNewClients')}
                </p>
              </div>
            </div>
            <Button
              variant={isAvailable ? 'outline' : 'default'}
              onClick={() => setIsAvailable(!isAvailable)}
            >
              {isAvailable ? t('disableAvailability') : t('enableAvailability')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {t('selectLocations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-foreground-muted">
            {t('selectLocationsDescription')}
          </p>

          <div className="space-y-6">
            {countries.map((country) =>
              country.regions.map((region) => (
                <div key={region.id}>
                  <h4 className="mb-3 text-sm font-medium text-foreground-muted">
                    {countries.length > 1 || country.regions.length > 1
                      ? `${country.name} - ${region.name}`
                      : region.name}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {region.cities.map((city) => (
                      <div key={city.id} className="flex items-center gap-3">
                        <Checkbox
                          id={city.id}
                          checked={selectedLocations.includes(city.id)}
                          onCheckedChange={() => handleLocationToggle(city.id)}
                          disabled={!isAvailable}
                        />
                        <Label
                          htmlFor={city.id}
                          className={cn(
                            'cursor-pointer text-sm',
                            !isAvailable && 'opacity-50'
                          )}
                        >
                          {city.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Selection Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('currentAvailability')}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedLocations.length === 0 ? (
            <p className="text-foreground-muted">{t('noLocationsSelected')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map((cityId) => (
                <span
                  key={cityId}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  <MapPin className="h-3 w-3" />
                  {getCityName(cityId)}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Čuvanje...' : t('saveAvailability')}
        </Button>
      </div>
    </div>
  );
}
