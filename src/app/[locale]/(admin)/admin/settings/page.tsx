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
import { Settings, DollarSign, MapPin, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useApi } from '@/hooks';
import { toast } from 'sonner';

interface PackageSetting {
  id: string;
  packageType: 'BASIC' | 'BONUS';
  price: number;
  isActive: boolean;
}

interface SettingsCity {
  id: string;
  name: string;
  region: {
    name: string;
    country: {
      name: string;
    };
  };
}

interface SettingsResponse {
  packageSettings: PackageSetting[];
  unavailableCityIds: string[];
  cities: SettingsCity[];
}

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings from API
  const { data, isLoading, error, refetch } = useApi<SettingsResponse>('/api/admin/settings');

  // Local form state
  const [basicPrice, setBasicPrice] = useState(3000);
  const [bonusPrice, setBonusPrice] = useState(7000);
  const [unavailableCityIds, setUnavailableCityIds] = useState<string[]>([]);

  // Initialize form with fetched data
  useEffect(() => {
    if (data) {
      const basicSetting = data.packageSettings?.find((p) => p.packageType === 'BASIC');
      const bonusSetting = data.packageSettings?.find((p) => p.packageType === 'BONUS');

      if (basicSetting) setBasicPrice(basicSetting.price);
      if (bonusSetting) setBonusPrice(bonusSetting.price);
      if (data.unavailableCityIds) setUnavailableCityIds(data.unavailableCityIds);
    }
  }, [data]);

  const handleLocationToggle = (cityId: string) => {
    setUnavailableCityIds((prev) =>
      prev.includes(cityId)
        ? prev.filter((l) => l !== cityId)
        : [...prev, cityId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSettings: [
            { packageType: 'BASIC', price: basicPrice },
            { packageType: 'BONUS', price: bonusPrice },
          ],
          unavailableCityIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri čuvanju');
      }

      refetch();
      toast.success(t('settingsSaved'));
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error(err instanceof Error ? err.message : t('settingsSaveError'));
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
          <h3 className="mt-4 text-lg font-medium text-error">{t('loadError')}</h3>
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
        <p className="mt-2 text-foreground-muted">{t('platformSettings')}</p>
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
                value={basicPrice}
                onChange={(e) => setBasicPrice(Number(e.target.value) || 0)}
              />
              <p className="text-sm text-foreground-muted">
                {t('current')}: {formatPrice(basicPrice)}
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
                {t('current')}: {formatPrice(bonusPrice)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t('reservationInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-foreground-muted">
                <strong>{t('reservationHoldTime')}:</strong> 36 sati
              </p>
              <p className="mt-2 text-sm text-foreground-muted">
                <strong>{t('cancellationCompensation')}:</strong> 20 EUR
              </p>
            </div>
            <p className="text-xs text-foreground-muted">
              {t('fixedSettingsNote')}
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
              {t('unavailableDescription')}
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {Object.entries(
                (data?.cities || []).reduce<Record<string, SettingsCity[]>>((acc, city) => {
                  const regionName = city.region.name;
                  if (!acc[regionName]) acc[regionName] = [];
                  acc[regionName].push(city);
                  return acc;
                }, {})
              ).map(([regionName, cities]) => (
                <div key={regionName}>
                  <h4 className="mb-3 text-sm font-medium">{regionName}</h4>
                  <div className="space-y-2">
                    {cities.map((city) => (
                      <div key={city.id} className="flex items-center gap-3">
                        <Checkbox
                          id={city.id}
                          checked={unavailableCityIds.includes(city.id)}
                          onCheckedChange={() => handleLocationToggle(city.id)}
                        />
                        <Label
                          htmlFor={city.id}
                          className={`cursor-pointer text-sm ${
                            unavailableCityIds.includes(city.id)
                              ? 'text-error line-through'
                              : ''
                          }`}
                        >
                          {city.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {unavailableCityIds.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning-light p-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
                <p className="text-sm text-warning-foreground">
                  {t('locationsUnavailable', { count: unavailableCityIds.length })}
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
          {isSaving ? t('saving') : t('saveSettings')}
        </Button>
      </div>
    </div>
  );
}
