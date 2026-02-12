'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Check, Users, MapPin, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PACKAGE_PRICES } from '@/lib/constants';

type PackageType = 'BASIC' | 'BONUS';

export default function PackagesPage() {
  const t = useTranslations('packages');
  const router = useRouter();
  // Pre-select previously chosen package if exists
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('selectedPackage') as PackageType | null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!selectedPackage) return;

    setIsLoading(true);
    // Clear downstream data when changing package so the flow restarts clean
    sessionStorage.removeItem('paymentData');
    sessionStorage.removeItem('travelFormData');
    sessionStorage.setItem('selectedPackage', selectedPackage);
    router.push('/payment');
  };

  const packages = [
    {
      type: 'BASIC' as const,
      name: t('basicPackage'),
      price: PACKAGE_PRICES.BASIC,
      priceLabel: t('basicPrice'),
      features: [
        { text: t('basicFeature1'), highlight: false },
        { text: t('basicFeature2'), highlight: false },
        { text: t('basicFeature3'), highlight: false },
        { text: t('basicFeature4'), highlight: false },
      ],
      icon: MapPin,
    },
    {
      type: 'BONUS' as const,
      name: t('bonusPackage'),
      price: PACKAGE_PRICES.BONUS,
      priceLabel: t('bonusPrice'),
      features: [
        { text: t('bonusFeature1'), highlight: false },
        { text: t('bonusFeature2'), highlight: true },
      ],
      icon: Users,
      recommended: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-foreground-muted">
          Izaberi paket koji ti najviše odgovara
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          const isSelected = selectedPackage === pkg.type;

          return (
            <Card
              key={pkg.type}
              className={cn(
                'relative cursor-pointer transition-all hover:shadow-lg',
                isSelected && 'ring-2 ring-primary',
                pkg.recommended && 'border-primary'
              )}
              onClick={() => setSelectedPackage(pkg.type)}
            >
              {pkg.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                  Preporučeno
                </div>
              )}

              <CardHeader className={cn(pkg.recommended ? 'bg-primary pt-8' : 'bg-secondary')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'h-6 w-6',
                        pkg.recommended ? 'text-primary-foreground' : 'text-secondary-foreground'
                      )}
                    />
                    <CardTitle
                      className={cn(
                        pkg.recommended ? 'text-primary-foreground' : 'text-secondary-foreground'
                      )}
                    >
                      {pkg.name}
                    </CardTitle>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                <p
                  className={cn(
                    'mt-2 text-3xl font-bold',
                    pkg.recommended ? 'text-primary-foreground' : 'text-secondary-foreground'
                  )}
                >
                  {pkg.priceLabel}
                </p>
              </CardHeader>

              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          'mt-0.5 h-5 w-5 flex-shrink-0',
                          feature.highlight ? 'text-primary' : 'text-success'
                        )}
                      />
                      <span
                        className={cn(
                          feature.highlight ? 'font-medium text-foreground' : 'text-foreground-muted'
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  className="mt-6 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPackage(pkg.type);
                  }}
                >
                  {isSelected ? 'Izabrano' : t('selectPackage')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Package Confirmation */}
      {selectedPackage && (
        <div className="mt-8 rounded-xl border border-primary bg-primary/5 p-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Check className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">
                  {t('selected', {
                    package: selectedPackage === 'BASIC' ? 'Osnovni' : 'Bonus',
                  })}
                </p>
                <p className="text-sm text-foreground-muted">
                  Cena: {selectedPackage === 'BASIC' ? '3.000' : '7.000'} RSD
                </p>
              </div>
            </div>
            <Button size="lg" onClick={handleContinue} disabled={isLoading}>
              {isLoading ? 'Učitavanje...' : t('continue')}
            </Button>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-sm text-foreground-muted">Siguran smeštaj</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Clock className="h-8 w-8 text-primary" />
          <span className="text-sm text-foreground-muted">Rezervacija 36h</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <MapPin className="h-8 w-8 text-primary" />
          <span className="text-sm text-foreground-muted">GPS lokacija</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Users className="h-8 w-8 text-primary" />
          <span className="text-sm text-foreground-muted">Vodič na terenu</span>
        </div>
      </div>
    </div>
  );
}
