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
  Building2,
  Eye,
  Clock,
  Check,
  X,
  Phone,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { formatPrice, formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks';

interface AdminBooking {
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
}

interface BookingsResponse {
  bookings: AdminBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminBookingsPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Fetch bookings
  const { data, isLoading, error } = useApi<BookingsResponse>('/api/admin/bookings?limit=100');

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.bookings) return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

    return {
      pending: data.bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: data.bookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: data.bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: data.bookings.filter((b) => b.status === 'CANCELLED').length,
    };
  }, [data?.bookings]);

  const filteredBookings = useMemo(() => {
    if (!data?.bookings) return [];

    return data.bookings.filter((booking) => {
      const matchesSearch =
        booking.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.accommodation?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data?.bookings, searchQuery, statusFilter]);

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
        return t('pendingBookings');
      case 'CONFIRMED':
        return t('confirmedBookings');
      case 'COMPLETED':
        return t('completedBookings');
      case 'CANCELLED':
        return t('cancelledBookings');
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('allBookings')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregled svih rezervacija u sistemu ({data?.pagination.total || 0})
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm text-foreground-muted">Na čekanju</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Check className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-foreground-muted">Potvrđene</p>
              <p className="text-xl font-bold">{stats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-foreground-muted" />
            <div>
              <p className="text-sm text-foreground-muted">Završene</p>
              <p className="text-xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <X className="h-5 w-5 text-error" />
            <div>
              <p className="text-sm text-foreground-muted">Otkazane</p>
              <p className="text-xl font-bold">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži po klijentu ili smeštaju..."
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
                <SelectItem value="PENDING">{t('pendingBookings')}</SelectItem>
                <SelectItem value="CONFIRMED">{t('confirmedBookings')}</SelectItem>
                <SelectItem value="COMPLETED">{t('completedBookings')}</SelectItem>
                <SelectItem value="CANCELLED">{t('cancelledBookings')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">Nema pronađenih rezervacija</h3>
          <p className="mt-2 text-foreground-muted">
            {searchQuery || statusFilter !== 'all'
              ? 'Probajte sa drugim filterima'
              : 'Još nema rezervacija u sistemu'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Main Row */}
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
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {booking.accommodation?.name || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.arrivalDate)}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            booking.packageType === 'BONUS'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-foreground-muted'
                          )}
                        >
                          {booking.packageType}
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
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Client */}
                      <div>
                        <h4 className="mb-3 font-semibold">Klijent</h4>
                        <div className="space-y-2 text-sm">
                          <p>{booking.guestName}</p>
                          <p className="text-foreground-muted">{booking.guestPhone}</p>
                          <p className="text-foreground-muted">{booking.guestEmail}</p>
                          <div className="flex gap-2">
                            {booking.hasViber && booking.guestPhone && (
                              <a
                                href={getViberLink(booking.guestPhone)}
                                className="rounded bg-[#7360F2]/10 px-2 py-1 text-xs text-[#7360F2]"
                              >
                                <Phone className="mr-1 inline h-3 w-3" />
                                Viber
                              </a>
                            )}
                            {booking.hasWhatsApp && booking.guestPhone && (
                              <a
                                href={getWhatsAppLink(booking.guestPhone)}
                                className="rounded bg-[#25D366]/10 px-2 py-1 text-xs text-[#25D366]"
                              >
                                <MessageCircle className="mr-1 inline h-3 w-3" />
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Accommodation */}
                      <div>
                        <h4 className="mb-3 font-semibold">Smeštaj</h4>
                        <div className="space-y-2 text-sm">
                          <p>{booking.accommodation?.name || 'N/A'}</p>
                          <p className="text-foreground-muted">
                            Vlasnik: {booking.accommodation?.owner?.name || 'N/A'}
                          </p>
                          <p className="text-foreground-muted">
                            {formatDate(booking.arrivalDate)} u {booking.arrivalTime}
                          </p>
                        </div>
                      </div>

                      {/* Guide & Actions */}
                      <div>
                        <h4 className="mb-3 font-semibold">Vodič</h4>
                        <div className="space-y-2 text-sm">
                          {booking.guide ? (
                            <>
                              <p>{booking.guide.name}</p>
                              {booking.guide.phone && (
                                <p className="text-foreground-muted">{booking.guide.phone}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-foreground-muted">Bez vodiča (Basic paket)</p>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-4 w-4" />
                            Detalji
                          </Button>
                        </div>
                      </div>
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
