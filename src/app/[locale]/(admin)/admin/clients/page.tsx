'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, Button, Input, DataTable, SimpleTooltip } from '@/components/ui';
import { UserCircle, Search, Calendar, Phone, Mail, Eye, Loader2 } from 'lucide-react';
import { formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';
import { useApi } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { ClientDetailDialog } from '@/components/admin/client-detail-dialog';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    bookings: number;
    accommodations: number;
    guidedBookings: number;
  };
}

interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const PAGE_SIZE = 10;

export default function AdminClientsPage() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    client: AdminUser | null;
  }>({
    open: false,
    client: null,
  });

  const openDetailDialog = (client: AdminUser) => {
    setDetailDialog({ open: true, client });
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'name',
      header: 'Klijent',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <UserCircle className="h-5 w-5 text-foreground-muted" />
          </div>
          <div>
            <p className="font-medium">{row.original.name || 'Bez imena'}</p>
            <p className="text-xs text-foreground-muted">
              {row.original.isActive ? 'Aktivan' : 'Neaktivan'}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Kontakt',
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-foreground-muted">
            <Mail className="h-4 w-4" />
            {row.original.email}
          </div>
          {row.original.phone && (
            <div className="flex items-center gap-2 text-foreground-muted">
              <Phone className="h-4 w-4" />
              {row.original.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'communication',
      header: 'Komunikacija',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.phone ? (
            <>
              <a
                href={getViberLink(row.original.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#7360F2]/10 px-2 py-1 text-xs text-[#7360F2] hover:bg-[#7360F2]/20"
              >
                Viber
              </a>
              <a
                href={getWhatsAppLink(row.original.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#25D366]/10 px-2 py-1 text-xs text-[#25D366] hover:bg-[#25D366]/20"
              >
                WhatsApp
              </a>
            </>
          ) : (
            <span className="text-xs text-foreground-muted">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: '_count.bookings',
      header: 'Rezervacije',
      cell: ({ row }) => <span className="text-sm">{row.original._count.bookings}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Registrovan',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Calendar className="h-4 w-4" />
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Akcije</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
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
        </div>
      ),
    },
  ];

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('role', 'CLIENT');
    params.set('page', page.toString());
    params.set('limit', PAGE_SIZE.toString());

    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }

    return `/api/admin/users?${params.toString()}`;
  }, [page, debouncedSearch]);

  const { data, isLoading, error } = useApi<UsersResponse>(buildApiUrl());

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
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
          <UserCircle className="mx-auto h-12 w-12 text-error" />
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('clientDatabase')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregled svih registrovanih klijenata ({pagination.total})
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži klijente po imenu, emailu ili telefonu..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.users ?? []}
            pageIndex={pagination.page - 1}
            pageSize={pagination.limit}
            pageCount={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            emptyMessage="Nema pronađenih klijenata"
          />
        </CardContent>
      </Card>

      {/* Client Detail Dialog */}
      <ClientDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}
        client={detailDialog.client}
      />
    </div>
  );
}
