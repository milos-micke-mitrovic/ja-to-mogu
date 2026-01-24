'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { Compass, Plus, Search, MapPin, Pencil, Trash2, Phone, Mail, Check, X } from 'lucide-react';
import { ALL_DESTINATIONS } from '@/lib/constants';

// Mock data
const mockGuides = [
  {
    id: '1',
    name: 'Marko Vodič',
    email: 'marko@email.rs',
    phone: '+381 60 111 2222',
    locations: ['POLIHRONO', 'HANIOTI', 'PEFKOHORI'],
    isAvailable: true,
    activeClients: 2,
    totalClients: 45,
  },
  {
    id: '2',
    name: 'Jelena Vodicka',
    email: 'jelena@email.rs',
    phone: '+381 63 222 3333',
    locations: ['NIKITI', 'NEOS_MARMARAS', 'SARTI'],
    isAvailable: true,
    activeClients: 1,
    totalClients: 32,
  },
  {
    id: '3',
    name: 'Stefan Vodic',
    email: 'stefan@email.rs',
    phone: '+381 64 333 4444',
    locations: ['PARALIA', 'OLIMPIK_BIC', 'LEPTOKARIJA'],
    isAvailable: false,
    activeClients: 0,
    totalClients: 28,
  },
];

export default function AdminGuidesPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = mockGuides.filter(
    (guide) =>
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLocationLabel = (locationValue: string) => {
    const dest = ALL_DESTINATIONS.find((d) => d.value === locationValue);
    return dest?.label || locationValue;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('guides')}</h1>
          <p className="mt-2 text-foreground-muted">Upravljajte vodičima na terenu</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addGuide')}
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži vodiče..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guides Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredGuides.map((guide) => (
          <Card key={guide.id}>
            <CardContent className="p-6">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Compass className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{guide.name}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        guide.isAvailable ? 'text-success' : 'text-foreground-muted'
                      }`}
                    >
                      {guide.isAvailable ? (
                        <>
                          <Check className="h-3 w-3" /> Dostupan
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" /> Nedostupan
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-error">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contact */}
              <div className="mb-4 space-y-1 text-sm">
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Mail className="h-4 w-4" />
                  {guide.email}
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Phone className="h-4 w-4" />
                  {guide.phone}
                </div>
              </div>

              {/* Locations */}
              <div className="mb-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground-muted">
                  <MapPin className="h-4 w-4" />
                  Lokacije
                </p>
                <div className="flex flex-wrap gap-1">
                  {guide.locations.map((loc) => (
                    <span
                      key={loc}
                      className="rounded bg-muted px-2 py-0.5 text-xs text-foreground-muted"
                    >
                      {getLocationLabel(loc)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 border-t border-border pt-4 text-sm">
                <div>
                  <p className="text-foreground-muted">Aktivni klijenti</p>
                  <p className="font-semibold">{guide.activeClients}</p>
                </div>
                <div>
                  <p className="text-foreground-muted">Ukupno klijenata</p>
                  <p className="font-semibold">{guide.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
