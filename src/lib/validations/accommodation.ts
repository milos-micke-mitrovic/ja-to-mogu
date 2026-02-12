import { z } from 'zod';

const statusValues = ['AVAILABLE', 'BOOKED', 'UNAVAILABLE'] as const;

export const accommodationSchema = z.object({
  name: z
    .string()
    .min(2, 'Naziv mora imati najmanje 2 karaktera')
    .max(100, 'Naziv može imati najviše 100 karaktera'),
  description: z.string().max(2000, 'Opis može imati najviše 2000 karaktera').optional().nullable(),
  type: z.string().min(1, 'Tip smeštaja je obavezan'),
  cityId: z.string().min(1, 'Izaberite destinaciju'),
  address: z.string().min(5, 'Adresa mora imati najmanje 5 karaktera'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  beds: z.number().min(1, 'Broj kreveta mora biti najmanje 1').max(50),
  rooms: z.number().min(1, 'Broj soba mora biti najmanje 1').max(20),
  hasParking: z.boolean().default(false),
  hasAC: z.boolean().default(false),
  hasWifi: z.boolean().default(false),
  hasKitchen: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasSeaView: z.boolean().default(false),
  distanceToBeach: z.number().min(0).max(10000).optional().nullable(),
  images: z.array(z.string().url()).max(5, 'Maksimalno 5 slika'),
  canReceiveFrom: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Unesite ispravno vreme')
    .optional()
    .nullable(),
  canReceiveTo: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Unesite ispravno vreme')
    .optional()
    .nullable(),
});

export const accommodationStatusSchema = z.object({
  status: z.enum(statusValues, {
    required_error: 'Izaberite status',
  }),
});

export const seasonalPriceSchema = z.object({
  season: z.enum(['LOW', 'MID', 'HIGH'], {
    required_error: 'Izaberite sezonu',
  }),
  duration: z.enum(['2-3', '4-7', '8-10', '10+'], {
    required_error: 'Izaberite trajanje',
  }),
  pricePerNight: z.number().min(0, 'Cena mora biti pozitivna'),
});

export const accommodationFilterSchema = z.object({
  cityId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minBeds: z.number().min(1).optional(),
  maxBeds: z.number().min(1).optional(),
  hasParking: z.boolean().optional(),
  hasAC: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  hasKitchen: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  hasSeaView: z.boolean().optional(),
});

export type AccommodationFormData = z.infer<typeof accommodationSchema>;
export type AccommodationStatusData = z.infer<typeof accommodationStatusSchema>;
export type SeasonalPriceFormData = z.infer<typeof seasonalPriceSchema>;
export type AccommodationFilterData = z.infer<typeof accommodationFilterSchema>;
