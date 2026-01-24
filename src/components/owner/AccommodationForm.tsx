'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Building2,
  MapPin,
  Bed,
  Home,
  Car,
  Wifi,
  Wind,
  ChefHat,
  Waves,
  Save,
  Loader2,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { DESTINATIONS } from '@/lib/constants';

// Form validation schema
const accommodationSchema = z.object({
  name: z.string().min(3, 'Naziv mora imati najmanje 3 karaktera'),
  description: z.string().optional(),
  type: z.string().min(1, 'Izaberite tip smeštaja'),
  destination: z.string().min(1, 'Izaberite destinaciju'),
  address: z.string().min(5, 'Adresa mora imati najmanje 5 karaktera'),
  beds: z.number().min(1, 'Minimalno 1 krevet'),
  rooms: z.number().min(1, 'Minimalno 1 soba'),
  distanceToBeach: z.number().min(0, 'Udaljenost ne može biti negativna').optional(),
  hasParking: z.boolean(),
  hasAC: z.boolean(),
  hasWifi: z.boolean(),
  hasKitchen: z.boolean(),
  hasPool: z.boolean(),
  hasSeaView: z.boolean(),
  canReceiveFrom: z.string().optional(),
  canReceiveTo: z.string().optional(),
  lowSeasonPrice: z.number().min(0).optional(),
  highSeasonPrice: z.number().min(0).optional(),
});

type AccommodationFormData = z.infer<typeof accommodationSchema>;

interface AccommodationFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<AccommodationFormData> & {
    id?: string;
    seasonalPrices?: Array<{
      season: string;
      duration: string;
      pricePerNight: number;
    }>;
  };
}

const ACCOMMODATION_TYPES = [
  { value: 'Apartman', label: 'Apartman' },
  { value: 'Studio', label: 'Studio' },
  { value: 'Vila', label: 'Vila' },
  { value: 'Kuća', label: 'Kuća' },
  { value: 'Soba', label: 'Soba' },
];

export function AccommodationForm({ mode, initialData }: AccommodationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract prices from seasonal prices if editing
  const lowSeasonPrice = initialData?.seasonalPrices?.find(
    (sp) => sp.season === 'LOW' && sp.duration === 'FOUR_SEVEN'
  )?.pricePerNight;
  const highSeasonPrice = initialData?.seasonalPrices?.find(
    (sp) => sp.season === 'HIGH' && sp.duration === 'FOUR_SEVEN'
  )?.pricePerNight;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'Apartman',
      destination: initialData?.destination || '',
      address: initialData?.address || '',
      beds: initialData?.beds || 2,
      rooms: initialData?.rooms || 1,
      distanceToBeach: initialData?.distanceToBeach || 0,
      hasParking: initialData?.hasParking || false,
      hasAC: initialData?.hasAC || false,
      hasWifi: initialData?.hasWifi || false,
      hasKitchen: initialData?.hasKitchen || false,
      hasPool: initialData?.hasPool || false,
      hasSeaView: initialData?.hasSeaView || false,
      canReceiveFrom: initialData?.canReceiveFrom || '14:00',
      canReceiveTo: initialData?.canReceiveTo || '22:00',
      lowSeasonPrice: lowSeasonPrice || 0,
      highSeasonPrice: highSeasonPrice || 0,
    },
  });

  const onSubmit = async (data: AccommodationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Build seasonal prices array
      const seasonalPrices = [];
      const durations = ['TWO_THREE', 'FOUR_SEVEN', 'EIGHT_TEN', 'TEN_PLUS'];
      const seasons = ['LOW', 'HIGH'];

      for (const season of seasons) {
        const basePrice = season === 'LOW' ? data.lowSeasonPrice : data.highSeasonPrice;
        if (basePrice && basePrice > 0) {
          for (const duration of durations) {
            // Apply discount for longer stays
            let multiplier = 1;
            if (duration === 'TWO_THREE') multiplier = 1.1;
            if (duration === 'EIGHT_TEN') multiplier = 0.95;
            if (duration === 'TEN_PLUS') multiplier = 0.9;

            seasonalPrices.push({
              season,
              duration,
              pricePerNight: Math.round(basePrice * multiplier),
            });
          }
        }
      }

      const payload = {
        name: data.name,
        description: data.description,
        type: data.type,
        destination: data.destination,
        address: data.address,
        beds: data.beds,
        rooms: data.rooms,
        distanceToBeach: data.distanceToBeach,
        hasParking: data.hasParking,
        hasAC: data.hasAC,
        hasWifi: data.hasWifi,
        hasKitchen: data.hasKitchen,
        hasPool: data.hasPool,
        hasSeaView: data.hasSeaView,
        canReceiveFrom: data.canReceiveFrom,
        canReceiveTo: data.canReceiveTo,
        seasonalPrices,
      };

      const url =
        mode === 'create'
          ? '/api/owner/accommodations'
          : `/api/owner/accommodations/${initialData?.id}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri čuvanju');
      }

      router.push('/owner/accommodations' as Parameters<typeof router.push>[0]);
      router.refresh();
    } catch (err) {
      console.error('Error saving accommodation:', err);
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju smeštaja');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/owner/accommodations"
        className="mb-6 inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad na smeštaje
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Osnovne informacije
            </CardTitle>
            <CardDescription>
              Unesite osnovne podatke o vašem smeštaju
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv smeštaja *</Label>
              <Input
                id="name"
                placeholder="npr. Apartman Sunce"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <textarea
                id="description"
                placeholder="Opišite vaš smeštaj..."
                className="min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('description')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tip smeštaja *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite tip" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOMMODATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-error">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Destinacija *</Label>
                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite destinaciju" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-semibold text-foreground-muted">
                          Halkidiki - Kasandra
                        </div>
                        {DESTINATIONS.HALKIDIKI_KASANDRA.map((dest) => (
                          <SelectItem key={dest.value} value={dest.value}>
                            {dest.label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-foreground-muted">
                          Halkidiki - Sitonija
                        </div>
                        {DESTINATIONS.HALKIDIKI_SITONIJA.map((dest) => (
                          <SelectItem key={dest.value} value={dest.value}>
                            {dest.label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-foreground-muted">
                          Olimpska regija
                        </div>
                        {DESTINATIONS.OLIMPSKA_REGIJA.map((dest) => (
                          <SelectItem key={dest.value} value={dest.value}>
                            {dest.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.destination && (
                  <p className="text-sm text-error">{errors.destination.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresa *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                  id="address"
                  placeholder="Ulica i broj"
                  className="pl-10"
                  {...register('address')}
                  aria-invalid={!!errors.address}
                />
              </div>
              {errors.address && (
                <p className="text-sm text-error">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              Kapacitet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="beds">Broj kreveta *</Label>
                <Input
                  id="beds"
                  type="number"
                  min={1}
                  {...register('beds', { valueAsNumber: true })}
                  aria-invalid={!!errors.beds}
                />
                {errors.beds && (
                  <p className="text-sm text-error">{errors.beds.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Broj soba *</Label>
                <Input
                  id="rooms"
                  type="number"
                  min={1}
                  {...register('rooms', { valueAsNumber: true })}
                  aria-invalid={!!errors.rooms}
                />
                {errors.rooms && (
                  <p className="text-sm text-error">{errors.rooms.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="distanceToBeach">
                  <Waves className="mr-1 inline h-4 w-4" />
                  Udaljenost od plaže (m)
                </Label>
                <Input
                  id="distanceToBeach"
                  type="number"
                  min={0}
                  {...register('distanceToBeach', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Sadržaji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Controller
                  name="hasParking"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasParking"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hasParking" className="flex cursor-pointer items-center gap-2">
                  <Car className="h-4 w-4 text-foreground-muted" />
                  Parking
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  name="hasAC"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasAC"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hasAC" className="flex cursor-pointer items-center gap-2">
                  <Wind className="h-4 w-4 text-foreground-muted" />
                  Klima uređaj
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  name="hasWifi"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasWifi"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hasWifi" className="flex cursor-pointer items-center gap-2">
                  <Wifi className="h-4 w-4 text-foreground-muted" />
                  WiFi
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  name="hasKitchen"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasKitchen"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hasKitchen" className="flex cursor-pointer items-center gap-2">
                  <ChefHat className="h-4 w-4 text-foreground-muted" />
                  Kuhinja
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  name="hasPool"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasPool"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hasPool" className="flex cursor-pointer items-center gap-2">
                  <Waves className="h-4 w-4 text-foreground-muted" />
                  Bazen
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  name="hasSeaView"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasSeaView"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="hasSeaView" className="flex cursor-pointer items-center gap-2">
                  <Waves className="h-4 w-4 text-foreground-muted" />
                  Pogled na more
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Cenovnik</CardTitle>
            <CardDescription>
              Unesite cenu po noćenju za svaku sezonu (automatski se primenjuju popusti za duže boravke)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lowSeasonPrice">Niska sezona (maj, jun, sep) - RSD/noć</Label>
                <Input
                  id="lowSeasonPrice"
                  type="number"
                  min={0}
                  placeholder="npr. 3000"
                  {...register('lowSeasonPrice', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highSeasonPrice">Visoka sezona (jul, avg) - RSD/noć</Label>
                <Input
                  id="highSeasonPrice"
                  type="number"
                  min={0}
                  placeholder="npr. 5000"
                  {...register('highSeasonPrice', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Vreme prijema gostiju
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="canReceiveFrom">Od</Label>
                <Input
                  id="canReceiveFrom"
                  type="time"
                  {...register('canReceiveFrom')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canReceiveTo">Do</Label>
                <Input
                  id="canReceiveTo"
                  type="time"
                  {...register('canReceiveTo')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 sm:flex-initial"
          >
            Otkaži
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 gap-2 sm:flex-initial"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Čuvanje...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Dodaj smeštaj' : 'Sačuvaj izmene'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
