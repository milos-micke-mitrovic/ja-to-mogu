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
import { ArrowLeft, Landmark, Banknote, Building2, Copy, Check } from 'lucide-react';
import { paymentFormSchema, type PaymentFormData } from '@/lib/validations/booking';
import { PACKAGE_PRICES, BANK_DETAILS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';

type PackageType = 'BASIC' | 'BONUS';
type PaymentMethod = 'bank_transfer' | 'cash';

export default function PaymentPage() {
  const t = useTranslations('payment');
  const tPackages = useTranslations('packages');
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
  });

  useEffect(() => {
    const pkg = sessionStorage.getItem('selectedPackage') as PackageType | null;
    setSelectedPackage(pkg);
    setReferenceNumber(`${BANK_DETAILS.referencePrefix}-${Date.now().toString().slice(-8)}`);
    setIsReady(true);
    if (!pkg) {
      router.push('/packages');
    }
  }, [router]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Kopirano');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const onSubmit = (data: PaymentFormData) => {
    if (!selectedPackage || !paymentMethod) return;

    sessionStorage.setItem('paymentData', JSON.stringify({
      ...data,
      packageType: selectedPackage,
      amount: PACKAGE_PRICES[selectedPackage],
      paymentMethod,
      paidAt: new Date().toISOString(),
    }));

    router.push('/travel-form');
  };

  if (!isReady || !selectedPackage) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-muted">{t('processing')}</p>
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
        {tPackages('title')}
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Landmark className="h-5 w-5 text-primary" />
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
                  {selectedPackage === 'BONUS' && tPackages('bonusFeature2')}
                </p>
              </div>
              <p className="text-xl font-bold text-primary">{formatPrice(packagePrice)}</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium">{t('selectMethod')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={cn(
                  'cursor-pointer rounded-lg border-2 p-4 text-left transition-all',
                  paymentMethod === 'bank_transfer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground-muted'
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t('bankTransfer')}</span>
                </div>
                <p className="text-xs text-foreground-muted">{t('bankTransferDesc')}</p>
              </button>

              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  'cursor-pointer rounded-lg border-2 p-4 text-left transition-all',
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground-muted'
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t('cash')}</span>
                </div>
                <p className="text-xs text-foreground-muted">{t('cashDesc')}</p>
              </button>
            </div>
          </div>

          {/* Bank Details (shown when bank transfer selected) */}
          {paymentMethod === 'bank_transfer' && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Building2 className="h-4 w-4 text-primary" />
                {t('bankDetails')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">{t('receiver')}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{BANK_DETAILS.receiverName}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_DETAILS.receiverName, 'receiver')}
                      className="cursor-pointer text-foreground-muted hover:text-foreground"
                    >
                      {copiedField === 'receiver' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">{t('bankName')}:</span>
                  <span className="font-medium">{BANK_DETAILS.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">{t('accountNumber')}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{BANK_DETAILS.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, 'account')}
                      className="cursor-pointer text-foreground-muted hover:text-foreground"
                    >
                      {copiedField === 'account' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">{t('model')}:</span>
                  <span className="font-medium">{BANK_DETAILS.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">{t('reference')}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{referenceNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(referenceNumber, 'reference')}
                      className="cursor-pointer text-foreground-muted hover:text-foreground"
                    >
                      {copiedField === 'reference' ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payer Info Form */}
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

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!paymentMethod}
            >
              {t('continueToForm')}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-4 border-t pt-6">
          {paymentMethod === 'bank_transfer' && (
            <p className="text-center text-xs text-foreground-muted">
              {t('bankTransferInstructions')}
            </p>
          )}
          {paymentMethod === 'cash' && (
            <p className="text-center text-xs text-foreground-muted">
              {t('cashInstructions')}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
