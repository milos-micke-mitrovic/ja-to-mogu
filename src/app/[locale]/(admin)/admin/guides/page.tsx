'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { Compass, Plus, Search, MapPin, Pencil, Trash2, Phone, Mail, Check, X, Loader2 } from 'lucide-react';
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

export default function AdminGuidesPage() {
  const t = useTranslations('admin');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch guides (users with role GUIDE)
  const { data, isLoading, error } = useApi<UsersResponse>('/api/admin/users?role=GUIDE&limit=100');

  const filteredGuides = useMemo(() => {
    if (!data?.users) return [];

    return data.users.filter(
      (guide) =>
        guide.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Compass className="mx-auto h-12 w-12 text-error" />
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
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('guides')}</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte vodičima na terenu ({data?.pagination.total || 0})
          </p>
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
      {filteredGuides.length === 0 ? (
        <Card className="p-12 text-center">
          <Compass className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">Nema pronađenih vodiča</h3>
          <p className="mt-2 text-foreground-muted">
            {searchQuery ? 'Probajte sa drugim terminom pretrage' : 'Dodajte prvog vodiča'}
          </p>
        </Card>
      ) : (
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
                      <p className="font-semibold">{guide.name || 'Bez imena'}</p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          guide.isActive ? 'text-success' : 'text-foreground-muted'
                        }`}
                      >
                        {guide.isActive ? (
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
                  {guide.phone && (
                    <div className="flex items-center gap-2 text-foreground-muted">
                      <Phone className="h-4 w-4" />
                      {guide.phone}
                    </div>
                  )}
                </div>

                {/* Locations placeholder */}
                <div className="mb-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground-muted">
                    <MapPin className="h-4 w-4" />
                    Lokacije
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-foreground-muted">
                      Sve lokacije
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 border-t border-border pt-4 text-sm">
                  <div>
                    <p className="text-foreground-muted">Aktivni klijenti</p>
                    <p className="font-semibold">{guide._count.guidedBookings}</p>
                  </div>
                  <div>
                    <p className="text-foreground-muted">Ukupno klijenata</p>
                    <p className="font-semibold">{guide._count.guidedBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
