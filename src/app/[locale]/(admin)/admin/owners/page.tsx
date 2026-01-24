'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { Users, Plus, Search, Building2, Pencil, Trash2, Phone, Mail } from 'lucide-react';

// Mock data
const mockOwners = [
  {
    id: '1',
    name: 'Nikos Papadopoulos',
    email: 'nikos@email.gr',
    phone: '+30 697 123 4567',
    accommodationsCount: 3,
    totalBookings: 45,
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Maria Georgiou',
    email: 'maria@email.gr',
    phone: '+30 698 234 5678',
    accommodationsCount: 2,
    totalBookings: 28,
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Yannis Dimitriou',
    email: 'yannis@email.gr',
    phone: '+30 699 345 6789',
    accommodationsCount: 1,
    totalBookings: 12,
    status: 'INACTIVE',
  },
];

export default function AdminOwnersPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOwners = mockOwners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('owners')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte vlasnicima smeštajnih jedinica
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
                {filteredOwners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Users className="h-5 w-5 text-foreground-muted" />
                        </div>
                        <p className="font-medium">{owner.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-foreground-muted">
                          <Mail className="h-4 w-4" />
                          {owner.email}
                        </div>
                        <div className="flex items-center gap-2 text-foreground-muted">
                          <Phone className="h-4 w-4" />
                          {owner.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-foreground-muted" />
                        <span>{owner.accommodationsCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">{owner.totalBookings}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          owner.status === 'ACTIVE'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-foreground-muted'
                        }`}
                      >
                        {owner.status === 'ACTIVE' ? 'Aktivan' : 'Neaktivan'}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
