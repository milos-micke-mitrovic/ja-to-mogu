'use client';

import { useApi, useMutation } from './use-api';

export interface Booking {
  id: string;
  userId: string;
  accommodationId: string;
  packageType: 'BASIC' | 'BONUS';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  arrivalDate: string;
  duration: string;
  arrivalTime: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestAddress?: string;
  hasViber: boolean;
  hasWhatsApp: boolean;
  totalPrice: number;
  journeyStatus: 'NOT_STARTED' | 'DEPARTED' | 'IN_GREECE' | 'ARRIVED';
  departedAt?: string;
  arrivedGreeceAt?: string;
  arrivedDestinationAt?: string;
  guideId?: string;
  expiresAt: string;
  createdAt: string;
  accommodation?: {
    id: string;
    name: string;
    destination: string;
    address: string;
    images: string[];
    owner?: {
      name: string;
      phone: string;
    };
  };
  guide?: {
    id: string;
    name: string;
    phone: string;
  };
}

interface BookingInput {
  accommodationId: string;
  arrivalDate: string;
  arrivalTime: string;
  packageType: 'BASIC' | 'BONUS';
  totalPrice: number;
  travelFormData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    hasViber?: boolean;
    hasWhatsApp?: boolean;
    duration?: string;
  };
}

interface JourneyUpdateInput {
  journeyStatus: 'NOT_STARTED' | 'DEPARTED' | 'IN_GREECE' | 'ARRIVED';
}

export function useBookings(status?: string) {
  const url = status ? `/api/bookings?status=${status}` : '/api/bookings';
  return useApi<Booking[]>(url);
}

export function useCreateBooking() {
  return useMutation<Booking, BookingInput>('/api/bookings', 'POST');
}

export function useUpdateJourneyStatus(bookingId: string) {
  return useMutation<Booking, JourneyUpdateInput>(
    `/api/bookings/${bookingId}/journey`,
    'PATCH'
  );
}
