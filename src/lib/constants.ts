// Package prices (in RSD - can be adjusted for exchange rate)
export const PACKAGE_PRICES = {
  BASIC: 3000,
  BONUS: 7000,
} as const;

// Reservation validity (in hours)
export const RESERVATION_VALIDITY_HOURS = 36;

// Owner compensation for cancellation (in EUR)
export const OWNER_CANCELLATION_COMPENSATION_EUR = 20;

// Maximum images per accommodation
export const MAX_ACCOMMODATION_IMAGES = 5;

// Destinations grouped by region
export const DESTINATIONS = {
  HALKIDIKI_KASANDRA: [
    { value: 'POLIHRONO', label: 'Polihrono' },
    { value: 'KALITEA', label: 'Kalitea' },
    { value: 'HANIOTI', label: 'Hanioti' },
    { value: 'PEFKOHORI', label: 'Pefkohori' },
    { value: 'SIVIRI', label: 'Siviri' },
    { value: 'KASANDRA_OTHER', label: 'Kasandra - Ostalo' },
  ],
  HALKIDIKI_SITONIJA: [
    { value: 'NIKITI', label: 'Nikiti' },
    { value: 'NEOS_MARMARAS', label: 'Neos Marmaras' },
    { value: 'SARTI', label: 'Sarti' },
    { value: 'VOURVOUROU', label: 'Vourvourou' },
    { value: 'SITONIJA_OTHER', label: 'Sitonija - Ostalo' },
  ],
  OLIMPSKA_REGIJA: [
    { value: 'PARALIJA', label: 'Paralija' },
    { value: 'OLIMPIK_BIC', label: 'Olimpik Bič' },
    { value: 'LEPTOKARIJA', label: 'Leptokarija' },
    { value: 'PLATAMONA', label: 'Platamona' },
  ],
} as const;

// All destinations flat list
export const ALL_DESTINATIONS = [
  ...DESTINATIONS.HALKIDIKI_KASANDRA,
  ...DESTINATIONS.HALKIDIKI_SITONIJA,
  ...DESTINATIONS.OLIMPSKA_REGIJA,
] as const;

// Duration options
export const DURATION_OPTIONS = [
  { value: '2-3', label: '2-3 dana' },
  { value: '4-7', label: '4-7 dana' },
  { value: '8-10', label: '8-10 dana' },
  { value: '10+', label: 'Preko 10 dana' },
] as const;

// Season months
export const SEASON_MONTHS = {
  LOW: [5, 6, 9], // May, June, September
  HIGH: [7, 8], // July, August
  MID: [1, 2, 3, 4, 10, 11, 12], // Rest of the year
} as const;

// Journey status labels
export const JOURNEY_STATUS_LABELS = {
  NOT_STARTED: 'Nije krenuo',
  DEPARTED: 'Krenuo na put',
  IN_GREECE: 'Stigao u Grčku',
  ARRIVED: 'Stigao na destinaciju',
} as const;

// Booking status labels
export const BOOKING_STATUS_LABELS = {
  PENDING: 'Na čekanju',
  CONFIRMED: 'Potvrđeno',
  CANCELLED: 'Otkazano',
  COMPLETED: 'Završeno',
  NO_SHOW: 'Nije se pojavio',
} as const;

// User role labels
export const USER_ROLE_LABELS = {
  CLIENT: 'Klijent',
  OWNER: 'Vlasnik smeštaja',
  GUIDE: 'Vodič',
  ADMIN: 'Administrator',
} as const;

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  ACCOMMODATIONS: '/api/accommodations',
  BOOKINGS: '/api/bookings',
  GUIDES: '/api/guides',
  OWNERS: '/api/owners',
  PAYMENTS: '/api/payments',
  REVIEWS: '/api/reviews',
  USERS: '/api/users',
} as const;

// App routes
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  PACKAGES: '/packages',
  PAYMENT: '/payment',
  TRAVEL_FORM: '/travel-form',
  CATALOG: '/catalog',
  BOOKING_CONFIRMATION: '/booking-confirmation',
  JOURNEY: '/journey',
  HISTORY: '/history',
  PROFILE: '/profile',
  ADMIN: {
    ROOT: '/admin',
    ACCOMMODATIONS: '/admin/accommodations',
    OWNERS: '/admin/owners',
    GUIDES: '/admin/guides',
    BOOKINGS: '/admin/bookings',
    CLIENTS: '/admin/clients',
    SETTINGS: '/admin/settings',
  },
  OWNER: {
    ROOT: '/owner',
    ACCOMMODATIONS: '/owner/accommodations',
    RESERVATIONS: '/owner/reservations',
  },
  GUIDE: {
    ROOT: '/guide',
    AVAILABILITY: '/guide/availability',
    CLIENTS: '/guide/clients',
  },
} as const;
