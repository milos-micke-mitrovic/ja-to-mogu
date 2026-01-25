'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  Button,
  Input,
  DataTable,
  ConfirmDialog,
  SimpleTooltip,
} from '@/components/ui';
import { Users, Plus, Search, Building2, Pencil, Trash2, Phone, Mail, Loader2, Eye } from 'lucide-react';
import { useApi } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'sonner';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { UserDetailDialog } from '@/components/admin/user-detail-dialog';

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

export default function AdminOwnersPage() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });
  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null,
  });

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('role', 'OWNER');
    params.set('page', page.toString());
    params.set('limit', PAGE_SIZE.toString());

    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }

    return `/api/admin/users?${params.toString()}`;
  }, [page, debouncedSearch]);

  const { data, isLoading, error, refetch } = useApi<UsersResponse>(buildApiUrl());

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

  const openDeleteDialog = (user: AdminUser) => {
    setDeleteDialog({ open: true, user });
  };

  const openAddDialog = () => {
    setFormDialog({ open: true, user: null });
  };

  const openEditDialog = (user: AdminUser) => {
    setFormDialog({ open: true, user });
  };

  const openDetailDialog = (user: AdminUser) => {
    setDetailDialog({ open: true, user });
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;

    setIsDeleting(deleteDialog.user.id);
    try {
      const response = await fetch(`/api/admin/users/${deleteDialog.user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri brisanju');
      }

      refetch();
    } catch (err) {
      console.error('Error deleting owner:', err);
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju');
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'name',
      header: 'Vlasnik',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Users className="h-5 w-5 text-foreground-muted" />
          </div>
          <p className="font-medium">{row.original.name || 'Bez imena'}</p>
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
      accessorKey: '_count.accommodations',
      header: 'Smeštaji',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-foreground-muted" />
          <span>{row.original._count.accommodations}</span>
        </div>
      ),
    },
    {
      accessorKey: '_count.bookings',
      header: 'Rezervacije',
      cell: ({ row }) => <span className="text-sm">{row.original._count.bookings}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.original.isActive ? 'bg-success/10 text-success' : 'bg-muted text-foreground-muted'
          }`}
        >
          {row.original.isActive ? 'Aktivan' : 'Neaktivan'}
        </span>
      ),
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
          <Users className="mx-auto h-12 w-12 text-error" />
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
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('owners')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte vlasnicima smeštajnih jedinica ({pagination.total})
          </p>
        </div>
        <Button className="gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          {t('addOwner')}
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži vlasnike..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Owners Table */}
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
            emptyMessage="Nema pronađenih vlasnika"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title="Obriši vlasnika"
        description={`Da li ste sigurni da želite da obrišete vlasnika "${deleteDialog.user?.name || ''}"? Ova akcija se ne može poništiti.`}
        confirmLabel="Obriši"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting === deleteDialog.user?.id}
      />

      {/* Add/Edit User Dialog */}
      <UserFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        user={formDialog.user}
        role="OWNER"
        onSuccess={refetch}
      />

      {/* User Detail Dialog */}
      <UserDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}
        user={detailDialog.user}
      />
    </div>
  );
}
