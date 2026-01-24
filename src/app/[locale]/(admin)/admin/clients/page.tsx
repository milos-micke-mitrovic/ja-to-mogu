'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { UserCircle, Search, Calendar, Phone, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';
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

export default function AdminClientsPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch clients (users with role CLIENT)
  const { data, isLoading, error } = useApi<UsersResponse>('/api/admin/users?role=CLIENT&limit=100');

  const filteredClients = useMemo(() => {
    if (!data?.users) return [];

    return data.users.filter(
      (client) =>
        client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery)
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
          <UserCircle className="mx-auto h-12 w-12 text-error" />
          <h3 className="mt-4 text-lg font-medium text-error">Greška pri učitavanju</h3>
          <p className="mt-2 text-foreground-muted">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('clientDatabase')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregled svih registrovanih klijenata ({data?.pagination.total || 0})
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Klijent
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Kontakt
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Komunikacija
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Rezervacije
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground-muted">
                    Registrovan
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground-muted">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-foreground-muted">
                      Nema pronađenih klijenata
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <UserCircle className="h-5 w-5 text-foreground-muted" />
                          </div>
                          <div>
                            <p className="font-medium">{client.name || 'Bez imena'}</p>
                            <p className="text-xs text-foreground-muted">
                              {client.isActive ? 'Aktivan' : 'Neaktivan'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-foreground-muted">
                            <Mail className="h-4 w-4" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2 text-foreground-muted">
                              <Phone className="h-4 w-4" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {client.phone && (
                            <>
                              <a
                                href={getViberLink(client.phone)}
                                className="rounded bg-[#7360F2]/10 px-2 py-1 text-xs text-[#7360F2]"
                              >
                                Viber
                              </a>
                              <a
                                href={getWhatsAppLink(client.phone)}
                                className="rounded bg-[#25D366]/10 px-2 py-1 text-xs text-[#25D366]"
                              >
                                WhatsApp
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">{client._count.bookings}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                          <Calendar className="h-4 w-4" />
                          {formatDate(client.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {t('contactClient')}
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
