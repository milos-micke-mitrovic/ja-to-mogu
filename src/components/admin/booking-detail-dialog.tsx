'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import {
  User,
  Building2,
  Calendar,
  Compass,
  CreditCard,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    hasViber: boolean;
    hasWhatsApp: boolean;
    status: string;
    journeyStatus: string;
    packageType: string;
    totalPrice: number;
    arrivalDate: string;
    arrivalTime: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
    accommodation: {
      id: string;
      name: string;
      destination: string;
      address: string;
      owner: {
        id: string;
        name: string;
        phone: string | null;
      };
    };
    guide: {
      id: string;
      name: string;
      phone: string | null;
    } | null;
  } | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-warning/10 text-warning';
    case 'CONFIRMED':
      return 'bg-success/10 text-success';
    case 'COMPLETED':
      return 'bg-muted text-foreground-muted';
    case 'CANCELLED':
      return 'bg-error/10 text-error';
    default:
      return 'bg-muted text-foreground-muted';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Na čekanju';
    case 'CONFIRMED':
      return 'Potvrđeno';
    case 'COMPLETED':
      return 'Završeno';
    case 'CANCELLED':
      return 'Otkazano';
    default:
      return status;
  }
};

const getJourneyStatusLabel = (status: string) => {
  switch (status) {
    case 'NOT_STARTED':
      return 'Nije krenuo';
    case 'DEPARTED':
      return 'Krenuo na put';
    case 'IN_GREECE':
      return 'Stigao u Grčku';
    case 'ARRIVED':
      return 'Stigao na destinaciju';
    default:
      return status;
  }
};

export function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalji rezervacije</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  getStatusColor(booking.status)
                )}
              >
                {getStatusLabel(booking.status)}
              </span>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  booking.packageType === 'BONUS'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-foreground-muted'
                )}
              >
                {booking.packageType}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(booking.totalPrice)}
              </p>
            </div>
          </div>

          {/* Guest Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <User className="h-4 w-4" />
              Podaci o gostu
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Ime:</span>
                <span className="font-medium">{booking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Email:</span>
                <span>{booking.guestEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Telefon:</span>
                <span>{booking.guestPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Komunikacija:</span>
                <div className="flex gap-2">
                  {booking.hasViber && (
                    <span className="rounded bg-[#7360F2]/10 px-2 py-0.5 text-xs text-[#7360F2]">
                      Viber
                    </span>
                  )}
                  {booking.hasWhatsApp && (
                    <span className="rounded bg-[#25D366]/10 px-2 py-0.5 text-xs text-[#25D366]">
                      WhatsApp
                    </span>
                  )}
                  {!booking.hasViber && !booking.hasWhatsApp && (
                    <span className="text-foreground-muted">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Accommodation Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4" />
              Smeštaj
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Naziv:</span>
                <span className="font-medium">{booking.accommodation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Destinacija:</span>
                <span>{booking.accommodation.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Adresa:</span>
                <span>{booking.accommodation.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Vlasnik:</span>
                <span>{booking.accommodation.owner.name}</span>
              </div>
              {booking.accommodation.owner.phone && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Tel. vlasnika:</span>
                  <span>{booking.accommodation.owner.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Travel Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4" />
              Detalji putovanja
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Datum dolaska:</span>
                <span className="font-medium">{formatDate(booking.arrivalDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Vreme dolaska:</span>
                <span>{booking.arrivalTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Status putovanja:</span>
                <span>{getJourneyStatusLabel(booking.journeyStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Kreirano:</span>
                <span>{formatDate(booking.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Guide Info (if BONUS package) */}
          {booking.packageType === 'BONUS' && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 flex items-center gap-2 font-medium">
                <Compass className="h-4 w-4" />
                Vodič
              </h3>
              {booking.guide ? (
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Ime:</span>
                    <span className="font-medium">{booking.guide.name}</span>
                  </div>
                  {booking.guide.phone && (
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">Telefon:</span>
                      <span>{booking.guide.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">Vodič nije dodeljen</p>
              )}
            </div>
          )}

          {/* Registered User Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <CreditCard className="h-4 w-4" />
              Registrovani korisnik
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Ime:</span>
                <span>{booking.user.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Email:</span>
                <span>{booking.user.email}</span>
              </div>
              {booking.user.phone && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Telefon:</span>
                  <span>{booking.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
