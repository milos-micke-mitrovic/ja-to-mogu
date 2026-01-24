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
  Building2,
  Plus,
  Search,
  MapPin,
  User,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data
const mockAccommodations = [
  {
    id: '1',
    name: 'Apartman Sunce',
    type: 'Apartman',
    location: 'Polihrono',
    ownerName: 'Nikos Papadopoulos',
    status: 'AVAILABLE',
    pricePerNight: 4500,
    beds: 4,
    bookingsCount: 12,
  },
  {
    id: '2',
    name: 'Vila Panorama',
    type: 'Vila',
    location: 'Polihrono',
    ownerName: 'Maria Georgiou',
    status: 'OCCUPIED',
    pricePerNight: 8000,
    beds: 6,
    bookingsCount: 8,
  },
  {
    id: '3',
    name: 'Studio More',
    type: 'Studio',
    location: 'Polihrono',
    ownerName: 'Nikos Papadopoulos',
    status: 'AVAILABLE',
    pricePerNight: 2500,
    beds: 2,
    bookingsCount: 15,
  },
  {
    id: '4',
    name: 'Apartman Olymp',
    type: 'Apartman',
    location: 'Paralia',
    ownerName: 'Yannis Dimitriou',
    status: 'MAINTENANCE',
    pricePerNight: 5000,
    beds: 4,
    bookingsCount: 5,
  },
];

export default function AdminAccommodationsPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const filteredAccommodations = mockAccommodations.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || acc.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-success/10 text-success';
      case 'OCCUPIED':
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
      case 'OCCUPIED':
        return 'Zauzeto';
      case 'MAINTENANCE':
        return 'Održavanje';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('accommodations')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte svim smeštajnim jedinicama u sistemu
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
                <SelectItem value="OCCUPIED">Zauzeto</SelectItem>
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
                <SelectItem value="Polihrono">Polihrono</SelectItem>
                <SelectItem value="Hanioti">Hanioti</SelectItem>
                <SelectItem value="Paralia">Paralia</SelectItem>
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
                {filteredAccommodations.map((accommodation) => (
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
                        <span className="text-sm">{accommodation.ownerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-foreground-muted" />
                        <span className="text-sm">{accommodation.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium">{formatPrice(accommodation.pricePerNight)}</span>
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
                    <td className="px-4 py-4 text-sm">{accommodation.bookingsCount}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
