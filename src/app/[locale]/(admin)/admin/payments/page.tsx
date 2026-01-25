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
  CreditCard,
  Search,
  User,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Calendar,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'sonner';

interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  transactionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    status: string;
    arrivalDate: string;
    packageType: string;
    accommodation: {
      id: string;
      name: string;
      destination: string;
    };
  };
}

interface PaymentsResponse {
  payments: AdminPayment[];
  stats: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
  };
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
    case 'COMPLETED':
      return 'bg-success/10 text-success';
    case 'FAILED':
      return 'bg-error/10 text-error';
    case 'REFUNDED':
      return 'bg-muted text-foreground-muted';
    default:
      return 'bg-muted text-foreground-muted';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Na čekanju';
    case 'COMPLETED':
      return 'Završeno';
    case 'FAILED':
      return 'Neuspešno';
    case 'REFUNDED':
      return 'Refundirano';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    case 'FAILED':
      return <XCircle className="h-4 w-4" />;
    case 'REFUNDED':
      return <RefreshCw className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

export default function AdminPaymentsPage() {
  const t = useTranslations('admin');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    paymentId: string;
    newStatus: string;
    title: string;
    description: string;
    variant: 'default' | 'destructive';
  }>({
    open: false,
    paymentId: '',
    newStatus: '',
    title: '',
    description: '',
    variant: 'default',
  });

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

    return `/api/admin/payments?${params.toString()}`;
  }, [page, debouncedSearch, statusFilter]);

  const { data, isLoading, error, refetch } = useApi<PaymentsResponse>(buildApiUrl());

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

  const openConfirmDialog = (paymentId: string, newStatus: string) => {
    const dialogConfig = {
      COMPLETED: {
        title: 'Potvrdi plaćanje',
        description: 'Da li ste sigurni da želite da potvrdite ovo plaćanje? Ova akcija će označiti plaćanje kao završeno.',
        variant: 'default' as const,
      },
      FAILED: {
        title: 'Odbij plaćanje',
        description: 'Da li ste sigurni da želite da odbijete ovo plaćanje? Ova akcija se ne može poništiti.',
        variant: 'destructive' as const,
      },
      REFUNDED: {
        title: 'Refundiraj plaćanje',
        description: 'Da li ste sigurni da želite da refundirate ovo plaćanje? Sredstva će biti vraćena klijentu.',
        variant: 'destructive' as const,
      },
    };

    const config = dialogConfig[newStatus as keyof typeof dialogConfig];
    if (config) {
      setConfirmDialog({
        open: true,
        paymentId,
        newStatus,
        ...config,
      });
    }
  };

  const handleUpdateStatus = async () => {
    const { paymentId, newStatus } = confirmDialog;
    setIsUpdating(paymentId);
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Greška pri ažuriranju');
      }

      refetch();

      const statusMessages: Record<string, string> = {
        COMPLETED: 'Plaćanje je potvrđeno',
        FAILED: 'Plaćanje je odbijeno',
        REFUNDED: 'Plaćanje je refundirano',
      };
      toast.success(statusMessages[newStatus] || 'Status plaćanja je ažuriran');
    } catch (err) {
      console.error('Error updating payment:', err);
      toast.error('Greška pri ažuriranju statusa plaćanja');
    } finally {
      setIsUpdating(null);
    }
  };

  const columns: ColumnDef<AdminPayment>[] = [
    {
      accessorKey: 'user.name',
      header: 'Klijent',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-foreground-muted" />
          </div>
          <div>
            <p className="font-medium">{row.original.user?.name || 'N/A'}</p>
            <p className="text-xs text-foreground-muted">{row.original.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'booking.accommodation.name',
      header: 'Smeštaj',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-foreground-muted" />
          <span>{row.original.booking?.accommodation?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'booking.packageType',
      header: 'Paket',
      cell: ({ row }) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            row.original.booking?.packageType === 'BONUS'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-foreground-muted'
          )}
        >
          {row.original.booking?.packageType}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Datum',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Calendar className="h-4 w-4" />
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
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
      accessorKey: 'amount',
      header: 'Iznos',
      cell: ({ row }) => (
        <span className="text-lg font-bold text-primary">{formatPrice(row.original.amount)}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Akcije</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex justify-end gap-1">
            {payment.status === 'PENDING' && (
              <>
                <SimpleTooltip content="Potvrdi">
                  <Button
                    size="sm"
                    onClick={() => openConfirmDialog(payment.id, 'COMPLETED')}
                    disabled={isUpdating === payment.id}
                    className="h-8 w-8 p-0"
                  >
                    {isUpdating === payment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                </SimpleTooltip>
                <SimpleTooltip content="Odbij">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openConfirmDialog(payment.id, 'FAILED')}
                    disabled={isUpdating === payment.id}
                    className="h-8 w-8 p-0 text-error hover:text-error"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </SimpleTooltip>
              </>
            )}
            {payment.status === 'COMPLETED' && (
              <SimpleTooltip content="Refundiraj">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openConfirmDialog(payment.id, 'REFUNDED')}
                  disabled={isUpdating === payment.id}
                  className="h-8 w-8 p-0"
                >
                  {isUpdating === payment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </SimpleTooltip>
            )}
          </div>
        );
      },
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
          <CreditCard className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  const stats = data?.stats;
  const pagination = data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('payments')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregled svih plaćanja u sistemu ({pagination.total})
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm text-foreground-muted">Na čekanju</p>
              <p className="text-xl font-bold">{stats?.pending || 0}</p>
              <p className="text-xs text-foreground-muted">
                {formatPrice(stats?.pendingAmount || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-foreground-muted">Završeno</p>
              <p className="text-xl font-bold">{stats?.completed || 0}</p>
              <p className="text-xs text-foreground-muted">
                {formatPrice(stats?.completedAmount || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-5 w-5 text-error" />
            <div>
              <p className="text-sm text-foreground-muted">Neuspešno</p>
              <p className="text-xl font-bold">{stats?.failed || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <RefreshCw className="h-5 w-5 text-foreground-muted" />
            <div>
              <p className="text-sm text-foreground-muted">Refundirano</p>
              <p className="text-xl font-bold">{stats?.refunded || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Revenue */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-foreground-muted">Ukupan promet</p>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(stats?.totalAmount || 0)}
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži po klijentu ili smeštaju..."
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
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="PENDING">Na čekanju</SelectItem>
                <SelectItem value="COMPLETED">Završeno</SelectItem>
                <SelectItem value="FAILED">Neuspešno</SelectItem>
                <SelectItem value="REFUNDED">Refundirano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.payments ?? []}
            pageIndex={pagination.page - 1}
            pageSize={pagination.limit}
            pageCount={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            emptyMessage="Nema pronađenih plaćanja"
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={handleUpdateStatus}
        isLoading={isUpdating === confirmDialog.paymentId}
      />
    </div>
  );
}
