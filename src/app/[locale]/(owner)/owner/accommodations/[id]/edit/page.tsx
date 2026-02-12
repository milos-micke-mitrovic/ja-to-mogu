'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AccommodationForm } from '@/components/owner/AccommodationForm';
import { Card } from '@/components/ui';
import { Loader2, Building2 } from 'lucide-react';

interface Accommodation {
  id: string;
  name: string;
  description: string | null;
  type: string;
  cityId: string;
  address: string;
  beds: number;
  rooms: number;
  distanceToBeach: number | null;
  hasParking: boolean;
  hasAC: boolean;
  hasWifi: boolean;
  hasKitchen: boolean;
  hasPool: boolean;
  hasSeaView: boolean;
  canReceiveFrom: string | null;
  canReceiveTo: string | null;
  seasonalPrices: Array<{
    season: string;
    duration: string;
    pricePerNight: number;
  }>;
}

export default function EditAccommodationPage() {
  const params = useParams();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const response = await fetch(`/api/owner/accommodations/${params.id}`);
        if (!response.ok) {
          throw new Error('Smeštaj nije pronađen');
        }
        const data = await response.json();
        setAccommodation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchAccommodation();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška</h3>
          <p className="mt-2 text-foreground-muted">{error || 'Smeštaj nije pronađen'}</p>
        </Card>
      </div>
    );
  }

  return (
    <AccommodationForm
      mode="edit"
      initialData={{
        id: accommodation.id,
        name: accommodation.name,
        description: accommodation.description || '',
        type: accommodation.type,
        cityId: accommodation.cityId,
        address: accommodation.address,
        beds: accommodation.beds,
        rooms: accommodation.rooms,
        distanceToBeach: accommodation.distanceToBeach || 0,
        hasParking: accommodation.hasParking,
        hasAC: accommodation.hasAC,
        hasWifi: accommodation.hasWifi,
        hasKitchen: accommodation.hasKitchen,
        hasPool: accommodation.hasPool,
        hasSeaView: accommodation.hasSeaView,
        canReceiveFrom: accommodation.canReceiveFrom || '14:00',
        canReceiveTo: accommodation.canReceiveTo || '22:00',
        seasonalPrices: accommodation.seasonalPrices,
      }}
    />
  );
}
