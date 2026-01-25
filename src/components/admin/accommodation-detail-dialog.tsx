'use client';

import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components/ui';
import {
  Building2,
  MapPin,
  User,
  Bed,
  DoorOpen,
  Calendar,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALL_DESTINATIONS } from '@/lib/constants';

// Dynamic import for Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/ui/map').then((mod) => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] w-full items-center justify-center rounded-lg bg-muted">
      <span className="text-sm text-foreground-muted">Učitavanje mape...</span>
    </div>
  ),
});

interface AccommodationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodation: {
    id: string;
    name: string;
    type: string;
    destination: string;
    address: string;
    status: string;
    minPricePerNight: number | null;
    beds: number;
    rooms: number;
    latitude: number;
    longitude: number;
    owner: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
    _count: {
      bookings: number;
      reviews: number;
    };
  } | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-success/10 text-success';
    case 'BOOKED':
      return 'bg-primary/10 text-primary';
    case 'MAINTENANCE':
      return 'bg-warning/10 text-warning';
    default:
      return 'bg-muted text-foreground-muted';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'Slobodno';
    case 'BOOKED':
      return 'Zauzeto';
    case 'MAINTENANCE':
      return 'Održavanje';
    default:
      return status;
  }
};

const getDestinationLabel = (destination: string) => {
  const dest = ALL_DESTINATIONS.find((d) => d.value === destination);
  return dest?.label || destination;
};

export function AccommodationDetailDialog({
  open,
  onOpenChange,
  accommodation,
}: AccommodationDetailDialogProps) {
  if (!accommodation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalji smeštaja</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with name and status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{accommodation.name}</h3>
                <p className="text-sm text-foreground-muted">{accommodation.type}</p>
              </div>
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium',
                getStatusColor(accommodation.status)
              )}
            >
              {getStatusLabel(accommodation.status)}
            </span>
          </div>

          {/* Location */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4" />
              Lokacija
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Destinacija:</span>
                <span className="font-medium">{getDestinationLabel(accommodation.destination)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Adresa:</span>
                <span>{accommodation.address}</span>
              </div>
            </div>
            {/* Map */}
            {accommodation.latitude !== 0 && accommodation.longitude !== 0 && (
              <div className="mt-4">
                <Map
                  latitude={accommodation.latitude}
                  longitude={accommodation.longitude}
                  markerTitle={accommodation.name}
                />
              </div>
            )}
          </div>

          {/* Capacity and Price */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <DoorOpen className="mx-auto h-5 w-5 text-foreground-muted" />
              <p className="mt-2 text-xl font-bold">{accommodation.rooms}</p>
              <p className="text-xs text-foreground-muted">Soba</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <Bed className="mx-auto h-5 w-5 text-foreground-muted" />
              <p className="mt-2 text-xl font-bold">{accommodation.beds}</p>
              <p className="text-xs text-foreground-muted">Ležaja</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <Calendar className="mx-auto h-5 w-5 text-foreground-muted" />
              <p className="mt-2 text-xl font-bold">{accommodation._count.bookings}</p>
              <p className="text-xs text-foreground-muted">Rezervacija</p>
            </div>
          </div>

          {/* Owner Info */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <User className="h-4 w-4" />
              Vlasnik
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Ime:</span>
                <span className="font-medium">{accommodation.owner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Email:</span>
                <span>{accommodation.owner.email}</span>
              </div>
              {accommodation.owner.phone && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Telefon:</span>
                  <span>{accommodation.owner.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {accommodation._count.reviews > 0 && (
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <Star className="h-4 w-4" />
              {accommodation._count.reviews} recenzija
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zatvori
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
