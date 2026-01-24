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

export default function AdminPaymentsPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Fetch payments
  const { data, isLoading, error, refetch } = useApi<PaymentsResponse>('/api/admin/payments?limit=100');

  const filteredPayments = useMemo(() => {
    if (!data?.payments) return [];

    return data.payments.filter((payment) => {
      const matchesSearch =
        payment.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.booking?.accommodation?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data?.payments, searchQuery, statusFilter]);

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

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
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
    } catch (err) {
      console.error('Error updating payment:', err);
    } finally {
      setIsUpdating(null);
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
          <CreditCard className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('payments')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregled svih plaćanja u sistemu ({data?.pagination.total || 0})
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
                <SelectItem value="PENDING">Na čekanju</SelectItem>
                <SelectItem value="COMPLETED">Završeno</SelectItem>
                <SelectItem value="FAILED">Neuspešno</SelectItem>
                <SelectItem value="REFUNDED">Refundirano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">Nema pronađenih plaćanja</h3>
          <p className="mt-2 text-foreground-muted">
            {searchQuery || statusFilter !== 'all'
              ? 'Probajte sa drugim filterima'
              : 'Još nema plaćanja u sistemu'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-foreground-muted" />
                    </div>
                    <div>
                      <p className="font-semibold">{payment.user?.name || 'N/A'}</p>
                      <p className="text-sm text-foreground-muted">{payment.user?.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {payment.booking?.accommodation?.name || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(payment.createdAt)}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            payment.booking?.packageType === 'BONUS'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-foreground-muted'
                          )}
                        >
                          {payment.booking?.packageType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                        getStatusColor(payment.status)
                      )}
                    >
                      {getStatusIcon(payment.status)}
                      {getStatusLabel(payment.status)}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(payment.amount)}
                    </span>
                  </div>
                </div>

                {/* Actions for pending payments */}
                {payment.status === 'PENDING' && (
                  <div className="mt-4 flex gap-2 border-t border-border pt-4">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(payment.id, 'COMPLETED')}
                      disabled={isUpdating === payment.id}
                      className="gap-1"
                    >
                      {isUpdating === payment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Potvrdi plaćanje
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(payment.id, 'FAILED')}
                      disabled={isUpdating === payment.id}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Odbij
                    </Button>
                  </div>
                )}

                {/* Refund action for completed payments */}
                {payment.status === 'COMPLETED' && (
                  <div className="mt-4 flex gap-2 border-t border-border pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(payment.id, 'REFUNDED')}
                      disabled={isUpdating === payment.id}
                      className="gap-1"
                    >
                      {isUpdating === payment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Refundiraj
                    </Button>
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
