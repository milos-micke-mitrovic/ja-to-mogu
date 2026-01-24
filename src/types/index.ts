// User roles
export type UserRole = 'CLIENT' | 'OWNER' | 'GUIDE' | 'ADMIN';

// Package types
export type PackageType = 'BASIC' | 'BONUS';

// Booking status
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

// Accommodation status
export type AccommodationStatus = 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';

// Journey status
export type JourneyStatus = 'NOT_STARTED' | 'DEPARTED' | 'IN_GREECE' | 'ARRIVED';

// Duration options
export type DurationOption = '2-3' | '4-7' | '8-10' | '10+';

// Destination locations
export type Destination =
  | 'POLIHRONO'
  | 'KALITEA'
  | 'HANIOTI'
  | 'PEFKOHORI'
  | 'SIVIRI'
  | 'KASANDRA_OTHER'
  | 'NIKITI'
  | 'NEOS_MARMARAS'
  | 'SARTI'
  | 'VOURVOUROU'
  | 'SITONIJA_OTHER'
  | 'PARALIJA'
  | 'OLIMPIK_BIC'
  | 'LEPTOKARIJA'
  | 'PLATAMONA';

// Season for pricing
export type Season = 'LOW' | 'MID' | 'HIGH';

// User interface
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: Date | null;
  image: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Accommodation interface
export interface Accommodation {
  id: string;
  name: string;
  description: string | null;
  type: string;
  destination: Destination;
  address: string;
  latitude: number;
  longitude: number;
  beds: number;
  rooms: number;
  hasParking: boolean;
  hasAC: boolean;
  hasWifi: boolean;
  images: string[];
  status: AccommodationStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Seasonal price interface
export interface SeasonalPrice {
  id: string;
  accommodationId: string;
  season: Season;
  duration: DurationOption;
  pricePerNight: number;
  createdAt: Date;
  updatedAt: Date;
}

// Booking interface
export interface Booking {
  id: string;
  userId: string;
  accommodationId: string;
  packageType: PackageType;
  status: BookingStatus;
  arrivalDate: Date;
  duration: DurationOption;
  arrivalTime: string;
  totalPrice: number;
  hasViber: boolean;
  hasWhatsApp: boolean;
  journeyStatus: JourneyStatus;
  departedAt: Date | null;
  arrivedGreeceAt: Date | null;
  arrivedDestinationAt: Date | null;
  guideId: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Guide availability interface
export interface GuideAvailability {
  id: string;
  guideId: string;
  destination: Destination;
  availableFrom: Date;
  availableTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Review interface
export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  accommodationId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Payment interface
export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: string | null;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TravelFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  arrivalDate: 'TODAY' | 'TOMORROW';
  destination: Destination;
  duration: DurationOption;
  arrivalTime: string;
  hasViber: boolean;
  hasWhatsApp: boolean;
}

export interface PaymentFormData {
  name: string;
  email: string;
  phone: string;
}
