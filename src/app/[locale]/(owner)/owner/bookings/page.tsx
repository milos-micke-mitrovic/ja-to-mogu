'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Calendar,
  Search,
  User,
  Phone,
  Mail,
  Clock,
  Check,
  X,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { formatPrice, formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks';

interface OwnerBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  hasViber: boolean;
  hasWhatsApp: boolean;
  arrivalDate: string;
  arrivalTime: string | null;
  duration: string;
  status: string;
  journeyStatus: string;
  totalPrice: number;
  createdAt: string;
  accommodation: {
    id: string;
    name: string;
    destination: string;
    address: string;
  };
}

export default function OwnerBookingsPage() {
  const t = useTranslations('ownerDashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Fetch bookings from API
  const { data: bookings, isLoading, refetch } = useApi<OwnerBooking[]>('/api/owner/bookings');

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.accommodation.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning/10 text-warning';
      case 'CONFIRMED':
        return 'bg-success/10 text-success';
      case 'CHECKED_IN':
        return 'bg-primary/10 text-primary';
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
        return t('pending');
      case 'CONFIRMED':
        return t('confirmed');
      case 'CHECKED_IN':
        return t('checkedIn');
      case 'COMPLETED':
        return t('completed');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  const getJourneyStatusLabel = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Nije krenuo';
      case 'DEPARTED':
        return 'Na putu';
      case 'IN_GREECE':
        return 'U Grčkoj';
      case 'ARRIVED':
        return 'Stigao';
      default:
        return status;
    }
  };

  const getJourneyStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'text-foreground-muted';
      case 'DEPARTED':
        return 'text-warning';
      case 'IN_GREECE':
        return 'text-primary';
      case 'ARRIVED':
        return 'text-success';
      default:
        return 'text-foreground-muted';
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await fetch(`/api/admin/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'CONFIRMED' }),
      });
      refetch();
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await fetch(`/api/admin/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'CANCELLED' }),
      });
      refetch();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('bookings')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregledajte i upravljajte rezervacijama za vaše smeštaje
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži po imenu gosta ili smeštaju..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="PENDING">{t('pending')}</SelectItem>
                <SelectItem value="CONFIRMED">{t('confirmed')}</SelectItem>
                <SelectItem value="CHECKED_IN">{t('checkedIn')}</SelectItem>
                <SelectItem value="COMPLETED">{t('completed')}</SelectItem>
                <SelectItem value="CANCELLED">{t('cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">{t('noBookings')}</h3>
          <p className="mt-2 text-foreground-muted">{t('noBookingsDescription')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Main Info */}
                <div
                  className="flex cursor-pointer flex-col gap-4 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  onClick={() =>
                    setExpandedBooking(expandedBooking === booking.id ? null : booking.id)
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-foreground-muted" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.guestName}</p>
                      <p className="text-sm text-foreground-muted">{booking.accommodation.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.arrivalDate)}
                        </span>
                        {booking.arrivalTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.arrivalTime}
                          </span>
                        )}
                        <span className={cn('font-medium', getJourneyStatusColor(booking.journeyStatus))}>
                          {getJourneyStatusLabel(booking.journeyStatus)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium',
                        getStatusColor(booking.status)
                      )}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBooking === booking.id && (
                  <div className="border-t border-border bg-muted/30 p-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Guest Details */}
                      <div>
                        <h4 className="mb-3 font-semibold">Podaci o gostu</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-foreground-muted" />
                            <a
                              href={`mailto:${booking.guestEmail}`}
                              className="text-primary hover:underline"
                            >
                              {booking.guestEmail}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-foreground-muted" />
                            <span>{booking.guestPhone}</span>
                          </div>
                        </div>

                        {/* Contact Options */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {booking.hasViber && (
                            <a
                              href={getViberLink(booking.guestPhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-[#7360F2]/10 px-3 py-2 text-sm font-medium text-[#7360F2] hover:bg-[#7360F2]/20"
                            >
                              <Phone className="h-4 w-4" />
                              Viber
                            </a>
                          )}
                          {booking.hasWhatsApp && (
                            <a
                              href={getWhatsAppLink(booking.guestPhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-2 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/20"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div>
                        <h4 className="mb-3 font-semibold">Detalji rezervacije</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Dolazak:</span>
                            <span>{formatDate(booking.arrivalDate)}{booking.arrivalTime ? ` u ${booking.arrivalTime}` : ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Trajanje:</span>
                            <span>{booking.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-muted">Rezervisano:</span>
                            <span>{formatDate(booking.createdAt)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Ukupno:</span>
                            <span className="text-primary">{formatPrice(booking.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button size="sm" className="gap-2" onClick={() => handleConfirmBooking(booking.id)}>
                            <Check className="h-4 w-4" />
                            Potvrdi
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2 text-error" onClick={() => handleCancelBooking(booking.id)}>
                            <X className="h-4 w-4" />
                            Odbij
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
