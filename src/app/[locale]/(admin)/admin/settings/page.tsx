'use client';

import { useState } from 'react';
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
import { Settings, DollarSign, MapPin, Save, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ALL_DESTINATIONS } from '@/lib/constants';

// Mock settings
const mockSettings = {
  basicPackagePrice: 3000,
  bonusPackagePrice: 7000,
  reservationHoldTime: 36,
  cancellationCompensation: 20,
  unavailableLocations: ['VOURVOUROU', 'TORONI'],
};

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState(mockSettings);

  const handlePriceChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: Number(value) || 0,
    }));
  };

  const handleLocationToggle = (location: string) => {
    setSettings((prev) => ({
      ...prev,
      unavailableLocations: prev.unavailableLocations.includes(location)
        ? prev.unavailableLocations.filter((l) => l !== location)
        : [...prev.unavailableLocations, location],
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // TODO: API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Saved settings:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('settings')}</h1>
        <p className="mt-2 text-foreground-muted">Podešavanja platforme</p>
      </div>

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
                value={settings.basicPackagePrice}
                onChange={(e) => handlePriceChange('basicPackagePrice', e.target.value)}
              />
              <p className="text-sm text-foreground-muted">
                Trenutno: {formatPrice(settings.basicPackagePrice)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonusPrice">{t('bonusPackagePrice')} (RSD)</Label>
              <Input
                id="bonusPrice"
                type="number"
                value={settings.bonusPackagePrice}
                onChange={(e) => handlePriceChange('bonusPackagePrice', e.target.value)}
              />
              <p className="text-sm text-foreground-muted">
                Trenutno: {formatPrice(settings.bonusPackagePrice)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Podešavanja rezervacija
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="holdTime">Vreme čuvanja rezervacije (sati)</Label>
              <Input
                id="holdTime"
                type="number"
                value={settings.reservationHoldTime}
                onChange={(e) => handlePriceChange('reservationHoldTime', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compensation">Kompenzacija za otkazivanje (EUR)</Label>
              <Input
                id="compensation"
                type="number"
                value={settings.cancellationCompensation}
                onChange={(e) => handlePriceChange('cancellationCompensation', e.target.value)}
              />
            </div>
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
                        checked={settings.unavailableLocations.includes(dest.value)}
                        onCheckedChange={() => handleLocationToggle(dest.value)}
                      />
                      <Label
                        htmlFor={dest.value}
                        className={`cursor-pointer text-sm ${
                          settings.unavailableLocations.includes(dest.value)
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
                        checked={settings.unavailableLocations.includes(dest.value)}
                        onCheckedChange={() => handleLocationToggle(dest.value)}
                      />
                      <Label
                        htmlFor={dest.value}
                        className={`cursor-pointer text-sm ${
                          settings.unavailableLocations.includes(dest.value)
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
                        checked={settings.unavailableLocations.includes(dest.value)}
                        onCheckedChange={() => handleLocationToggle(dest.value)}
                      />
                      <Label
                        htmlFor={dest.value}
                        className={`cursor-pointer text-sm ${
                          settings.unavailableLocations.includes(dest.value)
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

            {settings.unavailableLocations.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning-light p-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
                <p className="text-sm text-warning-foreground">
                  {settings.unavailableLocations.length} lokacija je označeno kao nedostupno.
                  Klijenti neće moći da rezervišu smeštaj na tim lokacijama.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
        </Button>
      </div>
    </div>
  );
}
