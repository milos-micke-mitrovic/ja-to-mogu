'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Checkbox,
} from '@/components/ui';
import { Settings, DollarSign, MapPin, Save, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ALL_DESTINATIONS } from '@/lib/constants';
import { useApi } from '@/hooks';

interface PackageSetting {
  id: string;
  packageType: 'BASIC' | 'BONUS';
  price: number;
  isActive: boolean;
}

interface SettingsResponse {
  packageSettings: PackageSetting[];
  unavailableLocations: string[];
}

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch settings from API
  const { data, isLoading, error, refetch } = useApi<SettingsResponse>('/api/admin/settings');

  // Local form state
  const [basicPrice, setBasicPrice] = useState(3000);
  const [bonusPrice, setBonusPrice] = useState(7000);
  const [unavailableLocations, setUnavailableLocations] = useState<string[]>([]);

  // Initialize form with fetched data
  useEffect(() => {
    if (data) {
      const basicSetting = data.packageSettings?.find((p) => p.packageType === 'BASIC');
      const bonusSetting = data.packageSettings?.find((p) => p.packageType === 'BONUS');

      if (basicSetting) setBasicPrice(basicSetting.price);
      if (bonusSetting) setBonusPrice(bonusSetting.price);
      if (data.unavailableLocations) setUnavailableLocations(data.unavailableLocations);
    }
  }, [data]);

  const handleLocationToggle = (location: string) => {
    setUnavailableLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSettings: [
            { packageType: 'BASIC', price: basicPrice },
            { packageType: 'BONUS', price: bonusPrice },
          ],
          unavailableLocations,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri čuvanju');
      }

      setSaveSuccess(true);
      refetch();

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveError(err instanceof Error ? err.message : 'Greška pri čuvanju podešavanja');
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

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12 text-center">
          <Settings className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('settings')}</h1>
        <p className="mt-2 text-foreground-muted">Podešavanja platforme</p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-success/10 p-4 text-success">
          <CheckCircle className="h-5 w-5" />
          Podešavanja su uspešno sačuvana
        </div>
      )}
      {saveError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-error/10 p-4 text-error">
          <AlertTriangle className="h-5 w-5" />
          {saveError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Package Prices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {t('packageSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="basicPrice">{t('basicPackagePrice')} (RSD)</Label>
              <Input
                id="basicPrice"
                type="number"
                value={basicPrice}
                onChange={(e) => setBasicPrice(Number(e.target.value) || 0)}
              />
              <p className="text-sm text-foreground-muted">
                Trenutno: {formatPrice(basicPrice)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonusPrice">{t('bonusPackagePrice')} (RSD)</Label>
              <Input
                id="bonusPrice"
                type="number"
                value={bonusPrice}
                onChange={(e) => setBonusPrice(Number(e.target.value) || 0)}
              />
              <p className="text-sm text-foreground-muted">
                Trenutno: {formatPrice(bonusPrice)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Informacije o rezervacijama
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-foreground-muted">
                <strong>Vreme čuvanja rezervacije:</strong> 36 sati
              </p>
              <p className="mt-2 text-sm text-foreground-muted">
                <strong>Kompenzacija za otkazivanje:</strong> 20 EUR
              </p>
            </div>
            <p className="text-xs text-foreground-muted">
              Ova podešavanja su fiksna i definisana uslovima korišćenja platforme.
            </p>
          </CardContent>
        </Card>

        {/* Location Availability */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t('locationAvailability')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-foreground-muted">
              Označite lokacije koje trenutno nisu dostupne za rezervaciju
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Halkidiki - Kasandra */}
              <div>
                <h4 className="mb-3 text-sm font-medium">Halkidiki - Kasandra</h4>
                <div className="space-y-2">
                  {ALL_DESTINATIONS.filter((d) =>
                    ['POLIHRONO', 'HANIOTI', 'PEFKOHORI', 'KRIOPIGI', 'KALITEA', 'AFITOS', 'SANI'].includes(
                      d.value
                    )
                  ).map((dest) => (
                    <div key={dest.value} className="flex items-center gap-3">
                      <Checkbox
                        id={dest.value}
                        checked={unavailableLocations.includes(dest.value)}
                        onCheckedChange={() => handleLocationToggle(dest.value)}
                      />
                      <Label
                        htmlFor={dest.value}
                        className={`cursor-pointer text-sm ${
                          unavailableLocations.includes(dest.value)
                            ? 'text-error line-through'
                            : ''
                        }`}
                      >
                        {dest.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Halkidiki - Sitonija */}
              <div>
                <h4 className="mb-3 text-sm font-medium">Halkidiki - Sitonija</h4>
                <div className="space-y-2">
                  {ALL_DESTINATIONS.filter((d) =>
                    ['NIKITI', 'NEOS_MARMARAS', 'SARTI', 'VOURVOUROU', 'TORONI'].includes(d.value)
                  ).map((dest) => (
                    <div key={dest.value} className="flex items-center gap-3">
                      <Checkbox
                        id={dest.value}
                        checked={unavailableLocations.includes(dest.value)}
                        onCheckedChange={() => handleLocationToggle(dest.value)}
                      />
                      <Label
                        htmlFor={dest.value}
                        className={`cursor-pointer text-sm ${
                          unavailableLocations.includes(dest.value)
                            ? 'text-error line-through'
                            : ''
                        }`}
                      >
                        {dest.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Olimpska regija */}
              <div>
                <h4 className="mb-3 text-sm font-medium">Olimpska regija</h4>
                <div className="space-y-2">
                  {ALL_DESTINATIONS.filter((d) =>
                    ['PARALIA', 'OLIMPIK_BIC', 'LEPTOKARIJA', 'PLATAMON'].includes(d.value)
                  ).map((dest) => (
                    <div key={dest.value} className="flex items-center gap-3">
                      <Checkbox
                        id={dest.value}
                        checked={unavailableLocations.includes(dest.value)}
                        onCheckedChange={() => handleLocationToggle(dest.value)}
                      />
                      <Label
                        htmlFor={dest.value}
                        className={`cursor-pointer text-sm ${
                          unavailableLocations.includes(dest.value)
                            ? 'text-error line-through'
                            : ''
                        }`}
                      >
                        {dest.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {unavailableLocations.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning-light p-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
                <p className="text-sm text-warning-foreground">
                  {unavailableLocations.length} lokacija je označeno kao nedostupno.
                  Klijenti neće moći da rezervišu smeštaj na tim lokacijama.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
        </Button>
      </div>
    </div>
  );
}
