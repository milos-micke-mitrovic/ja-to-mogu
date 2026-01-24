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
import { ALL_DESTINATIONS } from '@/lib/constants';

interface AdminAccommodation {
  id: string;
  name: string;
  type: string;
  destination: string;
  address: string;
  status: string;
  minPricePerNight: number | null;
  beds: number;
  rooms: number;
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

export default function AdminAccommodationsPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Fetch accommodations
  const { data, isLoading, error } = useApi<AccommodationsResponse>('/api/admin/accommodations?limit=100');

  const filteredAccommodations = useMemo(() => {
    if (!data?.accommodations) return [];

    return data.accommodations.filter((acc) => {
      const matchesSearch =
        acc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || acc.destination === locationFilter;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [data?.accommodations, searchQuery, statusFilter, locationFilter]);

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

  const getDestinationLabel = (destination: string) => {
    const dest = ALL_DESTINATIONS.find((d) => d.value === destination);
    return dest?.label || destination;
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
          <Building2 className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('accommodations')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte svim smeštajnim jedinicama u sistemu ({data?.pagination.total || 0})
          </p>
        </div>
        <Button className="gap-2">
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
              placeholder="Pretraži po nazivu ili vlasniku..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lokacija" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve lokacije</SelectItem>
                {ALL_DESTINATIONS.map((dest) => (
                  <SelectItem key={dest.value} value={dest.value}>
                    {dest.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Smeštaj
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Vlasnik
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Lokacija
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Cena
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Rezervacije
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground-muted">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAccommodations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-foreground-muted">
                      Nema pronađenih smeštaja
                    </td>
                  </tr>
                ) : (
                  filteredAccommodations.map((accommodation) => (
                    <tr key={accommodation.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Building2 className="h-5 w-5 text-foreground-muted" />
                          </div>
                          <div>
                            <p className="font-medium">{accommodation.name}</p>
                            <p className="text-sm text-foreground-muted">{accommodation.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-foreground-muted" />
                          <span className="text-sm">{accommodation.owner?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-foreground-muted" />
                          <span className="text-sm">{getDestinationLabel(accommodation.destination)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium">
                          {accommodation.minPricePerNight
                            ? formatPrice(accommodation.minPricePerNight)
                            : 'N/A'}
                        </span>
                        <span className="text-sm text-foreground-muted"> /noć</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-xs font-medium',
                            getStatusColor(accommodation.status)
                          )}
                        >
                          {getStatusLabel(accommodation.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">{accommodation._count.bookings}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-error">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
