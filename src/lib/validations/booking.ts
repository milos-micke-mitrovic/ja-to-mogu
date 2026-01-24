import { z } from 'zod';

const destinationValues = [
  'POLIHRONO',
  'KALITEA',
  'HANIOTI',
  'PEFKOHORI',
  'SIVIRI',
  'KASANDRA_OTHER',
  'NIKITI',
  'NEOS_MARMARAS',
  'SARTI',
  'VOURVOUROU',
  'SITONIJA_OTHER',
  'PARALIJA',
  'OLIMPIK_BIC',
  'LEPTOKARIJA',
  'PLATAMONA',
] as const;

const durationValues = ['2-3', '4-7', '8-10', '10+'] as const;

const packageTypeValues = ['BASIC', 'BONUS'] as const;

export const paymentFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Ime mora imati najmanje 2 karaktera')
    .max(100, 'Ime može imati najviše 100 karaktera'),
  email: z.string().email('Unesite ispravnu email adresu'),
  phone: z
    .string()
    .min(9, 'Broj telefona mora imati najmanje 9 cifara')
    .max(15, 'Broj telefona može imati najviše 15 cifara')
    .regex(/^[+]?[\d\s-]+$/, 'Unesite ispravan broj telefona'),
});

export const travelFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Ime mora imati najmanje 2 karaktera')
    .max(100, 'Ime može imati najviše 100 karaktera'),
  address: z
    .string()
    .min(5, 'Adresa mora imati najmanje 5 karaktera')
    .max(200, 'Adresa može imati najviše 200 karaktera'),
  email: z.string().email('Unesite ispravnu email adresu'),
  phone: z
    .string()
    .min(9, 'Broj telefona mora imati najmanje 9 cifara')
    .max(15, 'Broj telefona može imati najviše 15 cifara')
    .regex(/^[+]?[\d\s-]+$/, 'Unesite ispravan broj telefona'),
  arrivalDate: z.enum(['TODAY', 'TOMORROW'], {
    required_error: 'Izaberite dan dolaska',
  }),
  destination: z.enum(destinationValues, {
    required_error: 'Izaberite destinaciju',
  }),
  duration: z.enum(durationValues, {
    required_error: 'Izaberite dužinu boravka',
  }),
  arrivalTime: z
    .string()
    .min(1, 'Unesite vreme dolaska')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Unesite ispravno vreme (HH:MM)'),
  hasViber: z.boolean(),
  hasWhatsApp: z.boolean(),
});

export const packageSelectionSchema = z.object({
  packageType: z.enum(packageTypeValues, {
    required_error: 'Izaberite paket',
  }),
});

export const bookingConfirmationSchema = z.object({
  accommodationId: z.string().min(1, 'Izaberite smeštaj'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Morate prihvatiti uslove korišćenja' }),
  }),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Minimalna ocena je 1').max(5, 'Maksimalna ocena je 5'),
  comment: z
    .string()
    .max(1000, 'Komentar može imati najviše 1000 karaktera')
    .optional()
    .nullable(),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type TravelFormData = z.infer<typeof travelFormSchema>;
export type PackageSelectionData = z.infer<typeof packageSelectionSchema>;
export type BookingConfirmationData = z.infer<typeof bookingConfirmationSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
