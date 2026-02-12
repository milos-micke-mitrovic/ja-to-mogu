'use client';

import { useApi } from './use-api';

export interface City {
  id: string;
  name: string;
  slug: string;
  regionId: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  countryId: string;
  isActive: boolean;
  sortOrder: number;
  cities: City[];
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  regions: Region[];
}

export interface CityFlat {
  id: string;
  name: string;
  slug: string;
  regionName: string;
  countryName: string;
}

export function useDestinations() {
  const { data, isLoading, error, refetch } = useApi<Country[]>('/api/destinations');

  const countries = data || [];

  // Flatten cities for easy lookup
  const cities: CityFlat[] = countries.flatMap((country) =>
    country.regions.flatMap((region) =>
      region.cities.map((city) => ({
        id: city.id,
        name: city.name,
        slug: city.slug,
        regionName: region.name,
        countryName: country.name,
      }))
    )
  );

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    return city?.name || cityId;
  };

  return { countries, cities, isLoading, error, refetch, getCityName };
}
