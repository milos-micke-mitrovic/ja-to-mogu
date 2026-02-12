'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from '@/components/ui';
import { Car, MapPin, Calendar, Clock, Phone, ArrowLeft } from 'lucide-react';
import { travelFormSchema, type TravelFormData } from '@/lib/validations/booking';
import { DURATION_OPTIONS } from '@/lib/constants';
import { DestinationSelect } from '@/components/ui/destination-select';
import { Link } from '@/i18n/routing';

function RequiredMark() {
  return <span className="text-error">*</span>;
}

export default function TravelFormPage() {
  const t = useTranslations('travelForm');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPayment, setHasPayment] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TravelFormData>({
    resolver: zodResolver(travelFormSchema),
    defaultValues: {
      hasViber: false,
      hasWhatsApp: false,
    },
  });

  const hasViber = watch('hasViber');
  const hasWhatsApp = watch('hasWhatsApp');

  useEffect(() => {
    // Check if user has completed payment
    const paymentData = sessionStorage.getItem('paymentData');
    if (!paymentData) {
      router.push('/packages');
      return;
    }
    setHasPayment(true);
  }, [router]);

  const onSubmit = async (data: TravelFormData) => {
    setIsLoading(true);

    try {
      // Store travel form data in session
      sessionStorage.setItem('travelFormData', JSON.stringify(data));

      // Navigate to catalog — filter by city if known, otherwise show all
      const catalogUrl = data.cityId
        ? `/catalog?cityId=${data.cityId}`
        : `/catalog?destination=${encodeURIComponent(data.customDestination || '')}`;
      router.push(catalogUrl as Parameters<typeof router.push>[0]);
    } catch (error) {
      console.error('Error submitting travel form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPayment) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-muted">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/payment"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad
      </Link>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Car className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Lični podaci</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')} <RequiredMark /></Label>
                  <Input
                    id="name"
                    placeholder={t('namePlaceholder')}
                    {...register('name')}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')} <RequiredMark /></Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    {...register('phone')}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <p className="text-sm text-error">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')} <RequiredMark /></Label>
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
                <Label htmlFor="address">{t('address')} <RequiredMark /></Label>
                <Input
                  id="address"
                  placeholder={t('addressPlaceholder')}
                  {...register('address')}
                  aria-invalid={!!errors.address}
                />
                {errors.address && <p className="text-sm text-error">{errors.address.message}</p>}
              </div>
            </div>

            {/* Travel Details */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Detalji putovanja
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Arrival Date */}
                <div className="space-y-2">
                  <Label>{t('arrivalDate')} <RequiredMark /></Label>
                  <Controller
                    name="arrivalDate"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={field.value === 'TODAY' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => field.onChange('TODAY')}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {t('today')}
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === 'TOMORROW' ? 'default' : 'outline'}
                          className="w-full"
                          onClick={() => field.onChange('TOMORROW')}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {t('tomorrow')}
                        </Button>
                      </div>
                    )}
                  />
                  {errors.arrivalDate && (
                    <p className="text-sm text-error">{errors.arrivalDate.message}</p>
                  )}
                </div>

                {/* Arrival Time */}
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">{t('arrivalTime')} <RequiredMark /></Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                    <Input
                      id="arrivalTime"
                      type="time"
                      className="pl-10"
                      {...register('arrivalTime')}
                      aria-invalid={!!errors.arrivalTime}
                    />
                  </div>
                  {errors.arrivalTime && (
                    <p className="text-sm text-error">{errors.arrivalTime.message}</p>
                  )}
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label>{t('destination')} <RequiredMark /></Label>
                <Controller
                  name="cityId"
                  control={control}
                  render={({ field }) => (
                    <DestinationSelect
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      customDestination={watch('customDestination') || ''}
                      onCustomDestinationChange={(val) => {
                        setValue('customDestination', val, { shouldValidate: true });
                      }}
                      placeholder={t('destinationPlaceholder')}
                    />
                  )}
                />
                {errors.cityId && (
                  <p className="text-sm text-error">{errors.cityId.message}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>{t('duration')} <RequiredMark /></Label>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('durationPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.duration && <p className="text-sm text-error">{errors.duration.message}</p>}
              </div>
            </div>

            {/* Communication */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                {t('communication')} <RequiredMark />
              </h3>
              <p className="text-sm text-foreground-muted">{t('communicationNote')}</p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Controller
                    name="hasViber"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="hasViber"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="hasViber" className="cursor-pointer">
                    {t('hasViber')}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Controller
                    name="hasWhatsApp"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="hasWhatsApp"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="hasWhatsApp" className="cursor-pointer">
                    {t('hasWhatsApp')}
                  </Label>
                </div>
              </div>

              {!hasViber && !hasWhatsApp && (
                <p className="text-sm text-warning">
                  Molimo vas da označite bar jednu aplikaciju za komunikaciju
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                loading={isLoading}
                disabled={!hasViber && !hasWhatsApp}
              >
                <Car className="h-5 w-5" />
                {t('submit')}
              </Button>
              <p className="mt-2 text-center text-sm text-foreground-muted">
                {t('submitDescription')}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
