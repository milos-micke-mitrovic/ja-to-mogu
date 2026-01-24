'use client';

import { useApi, useMutation } from './use-api';

export interface SeasonalPrice {
  id: string;
  season: 'LOW' | 'MID' | 'HIGH';
  duration: string;
  pricePerNight: number;
}

export interface Accommodation {
  id: string;
  name: string;
  description?: string;
  type: string;
  destination: string;
  address: string;
  latitude: number;
  longitude: number;
  beds: number;
  rooms: number;
  hasParking: boolean;
  hasAC: boolean;
  hasWifi: boolean;
  hasKitchen: boolean;
  hasPool: boolean;
  hasSeaView: boolean;
  distanceToBeach?: number;
  images: string[];
  status: 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';
  canReceiveFrom?: string;
  canReceiveTo?: string;
  createdAt: string;
  seasonalPrices: SeasonalPrice[];
  owner?: {
    id: string;
    name: string;
    phone: string;
  };
  rating?: number;
  reviewCount?: number;
  minPricePerNight?: number;
}

interface AccommodationFilters {
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  hasParking?: boolean;
  hasAC?: boolean;
  hasWifi?: boolean;
  hasKitchen?: boolean;
  hasPool?: boolean;
  hasSeaView?: boolean;
}

function buildQueryString(filters: AccommodationFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function useAccommodations(filters: AccommodationFilters = {}) {
  const queryString = buildQueryString(filters);
  return useApi<Accommodation[]>(`/api/accommodations${queryString}`);
}

export function useOwnerAccommodations() {
  return useApi<Accommodation[]>('/api/owner/accommodations');
}

interface AccommodationInput {
  name: string;
  description?: string;
  type?: string;
  destination: string;
  address: string;
  latitude?: number;
  longitude?: number;
  beds: number;
  rooms: number;
  hasParking?: boolean;
  hasAC?: boolean;
  hasWifi?: boolean;
  hasKitchen?: boolean;
  hasPool?: boolean;
  hasSeaView?: boolean;
  distanceToBeach?: number;
  images?: string[];
  canReceiveFrom?: string;
  canReceiveTo?: string;
  seasonalPrices?: Array<{
    season: string;
    duration: string;
    pricePerNight: number;
  }>;
}

export function useCreateAccommodation() {
  return useMutation<Accommodation, AccommodationInput>('/api/owner/accommodations', 'POST');
}

export function useUpdateAccommodation(id: string) {
  return useMutation<Accommodation, Partial<AccommodationInput>>(
    `/api/owner/accommodations/${id}`,
    'PATCH'
  );
}

export function useDeleteAccommodation(id: string) {
  return useMutation<{ message: string }, Record<string, never>>(
    `/api/owner/accommodations/${id}`,
    'DELETE'
  );
}
