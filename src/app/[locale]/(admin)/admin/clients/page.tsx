'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { UserCircle, Search, Calendar, Phone, Mail, MessageCircle } from 'lucide-react';
import { formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';

// Mock data
const mockClients = [
  {
    id: '1',
    name: 'Marko Petrović',
    email: 'marko@email.com',
    phone: '+381 60 123 4567',
    hasViber: true,
    hasWhatsApp: true,
    totalBookings: 3,
    lastBooking: '2024-07-20',
    registeredAt: '2024-03-15',
  },
  {
    id: '2',
    name: 'Ana Jovanović',
    email: 'ana@email.com',
    phone: '+381 63 987 6543',
    hasViber: true,
    hasWhatsApp: false,
    totalBookings: 1,
    lastBooking: '2024-07-22',
    registeredAt: '2024-07-10',
  },
  {
    id: '3',
    name: 'Nikola Nikolić',
    email: 'nikola@email.com',
    phone: '+381 64 555 1234',
    hasViber: false,
    hasWhatsApp: true,
    totalBookings: 2,
    lastBooking: '2024-07-10',
    registeredAt: '2023-06-20',
  },
  {
    id: '4',
    name: 'Jovana Đorđević',
    email: 'jovana@email.com',
    phone: '+381 65 111 2222',
    hasViber: true,
    hasWhatsApp: true,
    totalBookings: 5,
    lastBooking: '2024-07-19',
    registeredAt: '2022-08-01',
  },
];

export default function AdminClientsPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('clientDatabase')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregled svih registrovanih klijenata
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
                    Poslednja rezervacija
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground-muted">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <UserCircle className="h-5 w-5 text-foreground-muted" />
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-foreground-muted">
                            Registrovan: {formatDate(client.registeredAt)}
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
                        <div className="flex items-center gap-2 text-foreground-muted">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {client.hasViber && (
                          <a
                            href={getViberLink(client.phone)}
                            className="rounded bg-[#7360F2]/10 px-2 py-1 text-xs text-[#7360F2]"
                          >
                            Viber
                          </a>
                        )}
                        {client.hasWhatsApp && (
                          <a
                            href={getWhatsAppLink(client.phone)}
                            className="rounded bg-[#25D366]/10 px-2 py-1 text-xs text-[#25D366]"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">{client.totalBookings}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-foreground-muted">
                        <Calendar className="h-4 w-4" />
                        {formatDate(client.lastBooking)}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
