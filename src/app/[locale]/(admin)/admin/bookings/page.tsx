'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { formatPrice, formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data
const mockBookings = [
  {
    id: '1',
    clientName: 'Marko Petrović',
    clientPhone: '+381 60 123 4567',
    hasViber: true,
    hasWhatsApp: true,
    accommodationName: 'Apartman Sunce',
    ownerName: 'Nikos Papadopoulos',
    checkIn: '2024-07-20',
    checkOut: '2024-07-27',
    status: 'CONFIRMED',
    journeyStatus: 'IN_GREECE',
    totalAmount: 31500,
    package: 'BONUS',
    guideName: 'Marko Vodič',
    createdAt: '2024-07-15',
  },
  {
    id: '2',
    clientName: 'Ana Jovanović',
    clientPhone: '+381 63 987 6543',
    hasViber: true,
    hasWhatsApp: false,
    accommodationName: 'Vila Panorama',
    ownerName: 'Maria Georgiou',
    checkIn: '2024-07-22',
    checkOut: '2024-07-29',
    status: 'PENDING',
    journeyStatus: 'NOT_STARTED',
    totalAmount: 56000,
    package: 'BASIC',
    guideName: null,
    createdAt: '2024-07-18',
  },
  {
    id: '3',
    clientName: 'Nikola Nikolić',
    clientPhone: '+381 64 555 1234',
    hasViber: false,
    hasWhatsApp: true,
    accommodationName: 'Studio More',
    ownerName: 'Nikos Papadopoulos',
    checkIn: '2024-07-10',
    checkOut: '2024-07-17',
    status: 'COMPLETED',
    journeyStatus: 'ARRIVED',
    totalAmount: 17500,
    package: 'BASIC',
    guideName: null,
    createdAt: '2024-07-05',
  },
];

export default function AdminBookingsPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.accommodationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('allBookings')}</h1>
        <p className="mt-2 text-foreground-muted">Pregled svih rezervacija u sistemu</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm text-foreground-muted">Na čekanju</p>
              <p className="text-xl font-bold">5</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Check className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-foreground-muted">Potvrđene</p>
              <p className="text-xl font-bold">18</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-foreground-muted" />
            <div>
              <p className="text-sm text-foreground-muted">Završene</p>
              <p className="text-xl font-bold">412</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <X className="h-5 w-5 text-error" />
            <div>
              <p className="text-sm text-foreground-muted">Otkazane</p>
              <p className="text-xl font-bold">12</p>
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
                    <p className="font-semibold">{booking.clientName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {booking.accommodationName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.checkIn)}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          booking.package === 'BONUS'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-foreground-muted'
                        )}
                      >
                        {booking.package}
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
                    {formatPrice(booking.totalAmount)}
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
                        <p>{booking.clientName}</p>
                        <p className="text-foreground-muted">{booking.clientPhone}</p>
                        <div className="flex gap-2">
                          {booking.hasViber && (
                            <a
                              href={getViberLink(booking.clientPhone)}
                              className="rounded bg-[#7360F2]/10 px-2 py-1 text-xs text-[#7360F2]"
                            >
                              <Phone className="mr-1 inline h-3 w-3" />
                              Viber
                            </a>
                          )}
                          {booking.hasWhatsApp && (
                            <a
                              href={getWhatsAppLink(booking.clientPhone)}
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
                        <p>{booking.accommodationName}</p>
                        <p className="text-foreground-muted">Vlasnik: {booking.ownerName}</p>
                        <p className="text-foreground-muted">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </p>
                      </div>
                    </div>

                    {/* Guide & Actions */}
                    <div>
                      <h4 className="mb-3 font-semibold">Vodič</h4>
                      <div className="space-y-2 text-sm">
                        {booking.guideName ? (
                          <p>{booking.guideName}</p>
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
    </div>
  );
}
