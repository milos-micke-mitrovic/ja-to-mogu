'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { CreditCard, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { paymentFormSchema, type PaymentFormData } from '@/lib/validations/booking';
import { PACKAGE_PRICES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { Link } from '@/i18n/routing';

type PackageType = 'BASIC' | 'BONUS';

export default function PaymentPage() {
  const t = useTranslations('payment');
  const tPackages = useTranslations('packages');
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  });

  useEffect(() => {
    // Get selected package from session storage
    const pkg = sessionStorage.getItem('selectedPackage') as PackageType | null;
    if (!pkg) {
      router.push('/packages');
      return;
    }
    setSelectedPackage(pkg);
  }, [router]);

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedPackage) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual payment processing
      // For now, we'll simulate a successful payment

      // Store payment data in session for the next step
      sessionStorage.setItem('paymentData', JSON.stringify({
        ...data,
        packageType: selectedPackage,
        amount: PACKAGE_PRICES[selectedPackage],
        paidAt: new Date().toISOString(),
      }));

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to travel form
      router.push('/travel-form');
    } catch {
      setError(t('failedDescription'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-muted">Učitavanje...</p>
      </div>
    );
  }

  const packagePrice = PACKAGE_PRICES[selectedPackage];
  const packageName = selectedPackage === 'BASIC' ? tPackages('basicPackage') : tPackages('bonusPackage');

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/packages"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad na pakete
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Package Summary */}
          <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{packageName}</p>
                <p className="text-sm text-foreground-muted">
                  {selectedPackage === 'BONUS' && 'Uključuje vodiča na terenu'}
                </p>
              </div>
              <p className="text-xl font-bold text-primary">{formatPrice(packagePrice)}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-error-light p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-error" />
              <p className="text-sm text-error-foreground">{error}</p>
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder')}
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-error">{errors.phone.message}</p>}
            </div>

            {/* Payment Method Placeholder */}
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-foreground-muted" />
              <p className="mt-2 text-sm text-foreground-muted">
                Sistem za plaćanje će biti integrisan
              </p>
              <p className="text-xs text-foreground-subtle">
                (Stripe, PayPal, ili lokalni provajder)
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? t('processing') : `${t('payNow')} - ${formatPrice(packagePrice)}`}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-4 border-t pt-6">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Shield className="h-4 w-4 text-success" />
            Sigurna transakcija
          </div>
          <p className="text-center text-xs text-foreground-subtle">
            Klikom na dugme &quot;Plati&quot; prihvatate naše uslove korišćenja
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
