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
  ConfirmDialog,
  SimpleTooltip,
} from '@/components/ui';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  User,
  Pencil,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks';
import { DestinationSelect } from '@/components/ui/destination-select';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'sonner';
import { AccommodationFormDialog } from '@/components/admin/accommodation-form-dialog';
import { AccommodationDetailDialog } from '@/components/admin/accommodation-detail-dialog';

interface AdminAccommodation {
  id: string;
  name: string;
  type: string;
  cityId: string;
  city?: {
    id: string;
    name: string;
  };
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
}

interface AccommodationsResponse {
  accommodations: AdminAccommodation[];
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

export default function AdminAccommodationsPage() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    accommodation: AdminAccommodation | null;
  }>({
    open: false,
    accommodation: null,
  });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    accommodation: AdminAccommodation | null;
  }>({
    open: false,
    accommodation: null,
  });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    accommodation: AdminAccommodation | null;
  }>({
    open: false,
    accommodation: null,
  });

  // Build API URL with filters
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
    if (locationFilter !== 'all') {
      params.set('cityId', locationFilter);
    }

    return `/api/admin/accommodations?${params.toString()}`;
  }, [page, debouncedSearch, statusFilter, locationFilter]);

  // Fetch accommodations with server-side filtering
  const { data, isLoading, error, refetch } = useApi<AccommodationsResponse>(buildApiUrl());

  // Debounce search input
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1); // Reset to first page on search
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1); // DataTable uses 0-indexed, API uses 1-indexed
  };

  const openDeleteDialog = (accommodation: AdminAccommodation) => {
    setDeleteDialog({ open: true, accommodation });
  };

  const openAddDialog = () => {
    setFormDialog({ open: true, accommodation: null });
  };

  const openEditDialog = (accommodation: AdminAccommodation) => {
    setFormDialog({ open: true, accommodation });
  };

  const openDetailDialog = (accommodation: AdminAccommodation) => {
    setDetailDialog({ open: true, accommodation });
  };

  const handleDelete = async () => {
    if (!deleteDialog.accommodation) return;

    setIsDeleting(deleteDialog.accommodation.id);
    try {
      const response = await fetch(`/api/admin/accommodations/${deleteDialog.accommodation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri brisanju');
      }

      refetch();
    } catch (err) {
      console.error('Error deleting accommodation:', err);
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju');
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: ColumnDef<AdminAccommodation>[] = [
    {
      accessorKey: 'name',
      header: 'Smeštaj',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-5 w-5 text-foreground-muted" />
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-sm text-foreground-muted">{row.original.type}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'owner.name',
      header: 'Vlasnik',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-foreground-muted" />
          <span className="text-sm">{row.original.owner?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'cityId',
      header: 'Lokacija',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-foreground-muted" />
          <span className="text-sm">{row.original.city?.name || row.original.cityId}</span>
        </div>
      ),
    },
    {
      accessorKey: 'minPricePerNight',
      header: 'Cena',
      cell: ({ row }) => (
        <>
          <span className="font-medium">
            {row.original.minPricePerNight ? formatPrice(row.original.minPricePerNight) : 'N/A'}
          </span>
          {row.original.minPricePerNight && (
            <span className="text-sm text-foreground-muted"> /noć</span>
          )}
        </>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={cn('rounded-full px-2 py-1 text-xs font-medium', getStatusColor(row.original.status))}
        >
          {getStatusLabel(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: '_count.bookings',
      header: 'Rezervacije',
      cell: ({ row }) => <span className="text-sm">{row.original._count.bookings}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Akcije</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <SimpleTooltip content="Pregled">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => openDetailDialog(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content="Izmeni">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => openEditDialog(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </SimpleTooltip>
          <SimpleTooltip content="Obriši">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-error hover:text-error"
              onClick={() => openDeleteDialog(row.original)}
              disabled={isDeleting === row.original.id}
            >
              {isDeleting === row.original.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

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
          <Building2 className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  const pagination = data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('accommodations')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte svim smeštajnim jedinicama u sistemu ({pagination.total})
          </p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          {t('addAccommodation')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži po nazivu ili adresi..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-40">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="AVAILABLE">Slobodno</SelectItem>
                <SelectItem value="BOOKED">Zauzeto</SelectItem>
                <SelectItem value="MAINTENANCE">Održavanje</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <DestinationSelect
              value={locationFilter}
              onValueChange={handleLocationChange}
              showAllOption
              allOptionLabel="Sve lokacije"
              placeholder="Lokacija"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.accommodations ?? []}
            pageIndex={pagination.page - 1}
            pageSize={pagination.limit}
            pageCount={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            emptyMessage="Nema pronađenih smeštaja"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title="Obriši smeštaj"
        description={`Da li ste sigurni da želite da obrišete smeštaj "${deleteDialog.accommodation?.name || ''}"? Ova akcija se ne može poništiti.`}
        confirmLabel="Obriši"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting === deleteDialog.accommodation?.id}
      />

      {/* Add/Edit Accommodation Dialog */}
      <AccommodationFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        accommodation={formDialog.accommodation}
        onSuccess={refetch}
      />

      {/* Accommodation Detail Dialog */}
      <AccommodationDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}
        accommodation={detailDialog.accommodation}
      />
    </div>
  );
}
