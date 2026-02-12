'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
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
  DataTable,
  SimpleTooltip,
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
  Loader2,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { BookingDetailDialog } from '@/components/admin/booking-detail-dialog';

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
    city?: { name: string };
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

const PAGE_SIZE = 10;

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-3 w-3" />;
    case 'CONFIRMED':
      return <Check className="h-3 w-3" />;
    case 'COMPLETED':
      return <Check className="h-3 w-3" />;
    case 'CANCELLED':
      return <X className="h-3 w-3" />;
    default:
      return null;
  }
};

export default function AdminBookingsPage() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    booking: AdminBooking | null;
  }>({
    open: false,
    booking: null,
  });

  const openDetailDialog = (booking: AdminBooking) => {
    setDetailDialog({ open: true, booking });
  };

  const columns: ColumnDef<AdminBooking>[] = [
    {
      accessorKey: 'guestName',
      header: t('guest'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-foreground-muted" />
          </div>
          <div>
            <p className="font-medium">{row.original.guestName}</p>
            <p className="text-xs text-foreground-muted">{row.original.guestPhone}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'accommodation.name',
      header: t('accommodation'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-foreground-muted" />
          <div>
            <p>{row.original.accommodation?.name || 'N/A'}</p>
            <p className="text-xs text-foreground-muted">{row.original.accommodation?.city?.name || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'arrivalDate',
      header: t('arrival'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-foreground-muted" />
          <div>
            <p>{formatDate(row.original.arrivalDate)}</p>
            <p className="text-xs text-foreground-muted">{row.original.arrivalTime}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'packageType',
      header: t('package'),
      cell: ({ row }) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            row.original.packageType === 'BONUS'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-foreground-muted'
          )}
        >
          {row.original.packageType}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => (
        <span
          className={cn(
            'flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
            getStatusColor(row.original.status)
          )}
        >
          {getStatusIcon(row.original.status)}
          {getStatusLabel(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: 'totalPrice',
      header: t('price'),
      cell: ({ row }) => (
        <span className="font-bold text-primary">{formatPrice(row.original.totalPrice)}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Akcije</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <SimpleTooltip content={t('preview')}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => openDetailDialog(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', PAGE_SIZE.toString());

    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }

    return `/api/admin/bookings?${params.toString()}`;
  }, [page, debouncedSearch, statusFilter]);

  const { data, isLoading, error, refetch } = useApi<BookingsResponse>(buildApiUrl());

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  if (isLoading && !data) {
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
          <h3 className="mt-4 text-lg font-medium text-error">{t('loadError')}</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  const pagination = data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('allBookings')}</h1>
        <p className="mt-2 text-foreground-muted">
          {t('bookingsOverview', { count: pagination.total })}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder={t('searchBookings')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
                <SelectItem value="CONFIRMED">{t('statusConfirmed')}</SelectItem>
                <SelectItem value="COMPLETED">{t('statusCompleted')}</SelectItem>
                <SelectItem value="CANCELLED">{t('statusCancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.bookings ?? []}
            pageIndex={pagination.page - 1}
            pageSize={pagination.limit}
            pageCount={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            emptyMessage={t('noBookingsFound')}
          />
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <BookingDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}
        booking={detailDialog.booking}
        onAction={async (bookingId, action) => {
          const res = await fetch('/api/admin/bookings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, ...action }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Greška pri ažuriranju');
          }
          refetch();
        }}
      />
    </div>
  );
}
