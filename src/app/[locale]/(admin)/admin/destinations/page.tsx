'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Checkbox,
  Spinner,
  ConfirmDialog,
} from '@/components/ui';
import { useApi } from '@/hooks';
import {
  Globe,
  MapPin,
  Building2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface City {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

interface Region {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  cities: City[];
}

interface Country {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  regions: Region[];
}

type EntityType = 'country' | 'region' | 'city';

interface FormState {
  open: boolean;
  type: EntityType;
  mode: 'create' | 'edit';
  id?: string;
  parentId?: string;
  name: string;
  isActive: boolean;
}

const defaultForm: FormState = {
  open: false,
  type: 'country',
  mode: 'create',
  name: '',
  isActive: true,
};

const typeLabels: Record<EntityType, { singular: string; icon: typeof Globe }> = {
  country: { singular: 'Država', icon: Globe },
  region: { singular: 'Region', icon: MapPin },
  city: { singular: 'Grad', icon: Building2 },
};

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
      )}
    >
      {isActive ? 'Aktivan' : 'Neaktivan'}
    </span>
  );
}

export default function AdminDestinationsPage() {
  const { data: countries, isLoading, refetch } = useApi<Country[]>('/api/admin/destinations');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormState>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: EntityType;
    id: string;
    name: string;
  }>({ open: false, type: 'country', id: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleCountry = (id: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const toggleRegion = (id: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const openCreate = (type: EntityType, parentId?: string) => {
    setForm({ open: true, type, mode: 'create', parentId, name: '', isActive: true });
  };

  const openEdit = (type: EntityType, id: string, name: string, isActive: boolean) => {
    setForm({ open: true, type, mode: 'edit', id, name, isActive });
  };

  const openDelete = (type: EntityType, id: string, name: string) => {
    setDeleteConfirm({ open: true, type, id, name });
  };

  const getEndpoint = (type: EntityType, id?: string) => {
    const base =
      type === 'country'
        ? '/api/admin/destinations'
        : type === 'region'
          ? '/api/admin/regions'
          : '/api/admin/cities';
    return id ? `${base}/${id}` : base;
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Naziv je obavezan');
      return;
    }

    setIsSubmitting(true);
    try {
      const isEdit = form.mode === 'edit';
      const url = getEndpoint(form.type, isEdit ? form.id : undefined);
      const body: Record<string, unknown> = { name: form.name.trim(), isActive: form.isActive };

      if (!isEdit && form.type === 'region' && form.parentId) {
        body.countryId = form.parentId;
      }
      if (!isEdit && form.type === 'city' && form.parentId) {
        body.regionId = form.parentId;
      }

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri čuvanju');
      }

      toast.success(
        isEdit
          ? `${typeLabels[form.type].singular} uspešno ažuriran`
          : `${typeLabels[form.type].singular} uspešno kreiran`
      );
      setForm(defaultForm);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri čuvanju');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const url = getEndpoint(deleteConfirm.type, deleteConfirm.id);
      const response = await fetch(url, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri brisanju');
      }

      toast.success(`${typeLabels[deleteConfirm.type].singular} uspešno obrisan`);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm((prev) => ({ ...prev, open: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Destinacije</h1>
          <p className="mt-2 text-foreground-muted">
            Upravljajte državama, regionima i gradovima
          </p>
        </div>
        <Button className="gap-2" onClick={() => openCreate('country')}>
          <Plus className="h-4 w-4" />
          Dodaj državu
        </Button>
      </div>

      {/* Tree View */}
      <div className="space-y-4">
        {(!countries || countries.length === 0) && (
          <Card className="p-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-foreground-muted" />
            <h3 className="mt-4 text-lg font-medium">Nema destinacija</h3>
            <p className="mt-2 text-foreground-muted">Dodajte prvu državu da biste započeli.</p>
          </Card>
        )}

        {countries?.map((country) => (
          <Card key={country.id}>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <button
                  className="flex flex-1 cursor-pointer items-center gap-2"
                  onClick={() => toggleCountry(country.id)}
                >
                  {expandedCountries.has(country.id) ? (
                    <ChevronDown className="h-5 w-5 text-foreground-muted" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-foreground-muted" />
                  )}
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{country.name}</CardTitle>
                  <ActiveBadge isActive={country.isActive} />
                  <span className="text-sm text-foreground-muted">
                    ({country.regions.length} regiona)
                  </span>
                </button>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => openCreate('region', country.id)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Region</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openEdit('country', country.id, country.name, country.isActive)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-error hover:text-error"
                    onClick={() => openDelete('country', country.id, country.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedCountries.has(country.id) && (
              <CardContent className="border-t pt-4">
                {country.regions.length === 0 && (
                  <p className="py-4 text-center text-sm text-foreground-muted">
                    Nema regiona. Dodajte prvi region.
                  </p>
                )}
                <div className="space-y-3">
                  {country.regions.map((region) => (
                    <div key={region.id} className="ml-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between p-3">
                        <button
                          className="flex flex-1 cursor-pointer items-center gap-2"
                          onClick={() => toggleRegion(region.id)}
                        >
                          {expandedRegions.has(region.id) ? (
                            <ChevronDown className="h-4 w-4 text-foreground-muted" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-foreground-muted" />
                          )}
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{region.name}</span>
                          <ActiveBadge isActive={region.isActive} />
                          <span className="text-sm text-foreground-muted">
                            ({region.cities.length} gradova)
                          </span>
                        </button>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => openCreate('city', region.id)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="hidden sm:inline">Grad</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              openEdit('region', region.id, region.name, region.isActive)
                            }
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-error hover:text-error"
                            onClick={() => openDelete('region', region.id, region.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {expandedRegions.has(region.id) && (
                        <div className="border-t px-3 py-2">
                          {region.cities.length === 0 && (
                            <p className="py-2 text-center text-sm text-foreground-muted">
                              Nema gradova. Dodajte prvi grad.
                            </p>
                          )}
                          <div className="space-y-1">
                            {region.cities.map((city) => (
                              <div
                                key={city.id}
                                className="ml-4 flex items-center justify-between rounded-md p-2 hover:bg-muted"
                              >
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-foreground-muted" />
                                  <span className="text-sm">{city.name}</span>
                                  <ActiveBadge isActive={city.isActive} />
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() =>
                                      openEdit('city', city.id, city.name, city.isActive)
                                    }
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-error hover:text-error"
                                    onClick={() => openDelete('city', city.id, city.name)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={form.open} onOpenChange={(open) => !open && setForm(defaultForm)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.mode === 'create' ? 'Dodaj' : 'Izmeni'} {typeLabels[form.type].singular.toLowerCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dest-name">Naziv</Label>
              <Input
                id="dest-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={`Unesite naziv...`}
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="dest-active"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked === true }))
                }
              />
              <Label htmlFor="dest-active" className="cursor-pointer">
                Aktivan
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(defaultForm)} disabled={isSubmitting}>
              Otkaži
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              {form.mode === 'create' ? 'Kreiraj' : 'Sačuvaj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
        title={`Obriši ${typeLabels[deleteConfirm.type].singular.toLowerCase()}`}
        description={`Da li ste sigurni da želite da obrišete "${deleteConfirm.name}"? Ova akcija se ne može poništiti.`}
        confirmLabel="Obriši"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
