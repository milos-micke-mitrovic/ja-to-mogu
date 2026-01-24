'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { Users, Plus, Search, Building2, Pencil, Trash2, Phone, Mail, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks';

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

export default function AdminOwnersPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch owners (users with role OWNER)
  const { data, isLoading, error } = useApi<UsersResponse>('/api/admin/users?role=OWNER&limit=100');

  const filteredOwners = useMemo(() => {
    if (!data?.users) return [];

    return data.users.filter(
      (owner) =>
        owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data?.users, searchQuery]);

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
          <Users className="mx-auto h-12 w-12 text-error" />
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
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('owners')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte vlasnicima smeštajnih jedinica ({data?.pagination.total || 0})
          </p>
        </div>
        <Button className="gap-2">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Owners Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Vlasnik
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Kontakt
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Smeštaji
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Rezervacije
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground-muted">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-foreground-muted">
                      Nema pronađenih vlasnika
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Users className="h-5 w-5 text-foreground-muted" />
                          </div>
                          <p className="font-medium">{owner.name || 'Bez imena'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-foreground-muted">
                            <Mail className="h-4 w-4" />
                            {owner.email}
                          </div>
                          {owner.phone && (
                            <div className="flex items-center gap-2 text-foreground-muted">
                              <Phone className="h-4 w-4" />
                              {owner.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-foreground-muted" />
                          <span>{owner._count.accommodations}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">{owner._count.bookings}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            owner.isActive
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-foreground-muted'
                          }`}
                        >
                          {owner.isActive ? 'Aktivan' : 'Neaktivan'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
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
