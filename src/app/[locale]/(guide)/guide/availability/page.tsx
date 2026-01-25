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
import { ALL_DESTINATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks';
import { toast } from 'sonner';

interface GuideAvailability {
  id: string;
  destination: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function GuideAvailabilityPage() {
  const t = useTranslations('guideDashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Fetch existing availability
  const { data: availabilities, isLoading, refetch } = useApi<GuideAvailability[]>('/api/guide/availability');

  // Initialize selected locations from fetched data
  useEffect(() => {
    if (availabilities && availabilities.length > 0) {
      const activeLocations = availabilities
        .filter((a) => a.isActive)
        .map((a) => a.destination);
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
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days from now

      // First, update existing ones to inactive if not selected
      if (availabilities) {
        for (const avail of availabilities) {
          const shouldBeActive = selectedLocations.includes(avail.destination) && isAvailable;
          if (avail.isActive !== shouldBeActive) {
            await fetch('/api/guide/availability', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ availabilityId: avail.id, isActive: shouldBeActive }),
            });
          }
        }
      }

      // Then, create new entries for locations not yet in the database
      const existingLocations = availabilities?.map((a) => a.destination) || [];
      for (const location of selectedLocations) {
        if (!existingLocations.includes(location)) {
          await fetch('/api/guide/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destination: location,
              startDate,
              endDate,
              isActive: isAvailable,
            }),
          });
        }
      }

      refetch();
      toast.success('Dostupnost je sačuvana');
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Greška pri čuvanju dostupnosti');
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
          <CardTitle>Status dostupnosti</CardTitle>
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
                  {isAvailable ? 'Dostupan za rad' : 'Nije dostupan'}
                </p>
                <p className="text-sm text-foreground-muted">
                  {isAvailable
                    ? 'Možete primati nove klijente'
                    : 'Nećete dobijati nove klijente'}
                </p>
              </div>
            </div>
            <Button
              variant={isAvailable ? 'outline' : 'default'}
              onClick={() => setIsAvailable(!isAvailable)}
            >
              {isAvailable ? 'Isključi dostupnost' : 'Uključi dostupnost'}
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
            Izaberite lokacije na kojima ste dostupni za vođenje
          </p>

          <div className="space-y-6">
            {/* Halkidiki - Kasandra */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground-muted">
                Halkidiki - Kasandra
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {ALL_DESTINATIONS.filter((d) =>
                  ['POLIHRONO', 'HANIOTI', 'PEFKOHORI', 'KRIOPIGI', 'KALITEA', 'AFITOS', 'SANI'].includes(
                    d.value
                  )
                ).map((dest) => (
                  <div key={dest.value} className="flex items-center gap-3">
                    <Checkbox
                      id={dest.value}
                      checked={selectedLocations.includes(dest.value)}
                      onCheckedChange={() => handleLocationToggle(dest.value)}
                      disabled={!isAvailable}
                    />
                    <Label
                      htmlFor={dest.value}
                      className={cn(
                        'cursor-pointer text-sm',
                        !isAvailable && 'opacity-50'
                      )}
                    >
                      {dest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Halkidiki - Sitonija */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground-muted">
                Halkidiki - Sitonija
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {ALL_DESTINATIONS.filter((d) =>
                  ['NIKITI', 'NEOS_MARMARAS', 'SARTI', 'VOURVOUROU', 'TORONI'].includes(d.value)
                ).map((dest) => (
                  <div key={dest.value} className="flex items-center gap-3">
                    <Checkbox
                      id={dest.value}
                      checked={selectedLocations.includes(dest.value)}
                      onCheckedChange={() => handleLocationToggle(dest.value)}
                      disabled={!isAvailable}
                    />
                    <Label
                      htmlFor={dest.value}
                      className={cn(
                        'cursor-pointer text-sm',
                        !isAvailable && 'opacity-50'
                      )}
                    >
                      {dest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Olimpska regija */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground-muted">Olimpska regija</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {ALL_DESTINATIONS.filter((d) =>
                  ['PARALIA', 'OLIMPIK_BIC', 'LEPTOKARIJA', 'PLATAMON'].includes(d.value)
                ).map((dest) => (
                  <div key={dest.value} className="flex items-center gap-3">
                    <Checkbox
                      id={dest.value}
                      checked={selectedLocations.includes(dest.value)}
                      onCheckedChange={() => handleLocationToggle(dest.value)}
                      disabled={!isAvailable}
                    />
                    <Label
                      htmlFor={dest.value}
                      className={cn(
                        'cursor-pointer text-sm',
                        !isAvailable && 'opacity-50'
                      )}
                    >
                      {dest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
            <p className="text-foreground-muted">Niste izabrali nijednu lokaciju</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map((loc) => {
                const dest = ALL_DESTINATIONS.find((d) => d.value === loc);
                return (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    <MapPin className="h-3 w-3" />
                    {dest?.label || loc}
                  </span>
                );
              })}
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
