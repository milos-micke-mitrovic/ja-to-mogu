'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { DestinationSelect } from '@/components/ui/destination-select';

interface Owner {
  id: string;
  name: string;
  email: string;
}

interface AccommodationFormData {
  name: string;
  type: string;
  cityId: string;
  address: string;
  status: string;
  beds: number;
  rooms: number;
  ownerId: string;
}

interface AccommodationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodation?: {
    id: string;
    name: string;
    type: string;
    cityId: string;
    address: string;
    status: string;
    beds: number;
    rooms: number;
    owner: {
      id: string;
      name: string;
    };
  } | null;
  onSuccess: () => void;
}

const ACCOMMODATION_TYPES = [
  { value: 'APARTMENT', label: 'Apartman' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'HOUSE', label: 'Kuća' },
  { value: 'VILLA', label: 'Vila' },
  { value: 'ROOM', label: 'Soba' },
];

const ACCOMMODATION_STATUSES = [
  { value: 'AVAILABLE', label: 'Slobodno' },
  { value: 'BOOKED', label: 'Zauzeto' },
  { value: 'MAINTENANCE', label: 'Održavanje' },
];

export function AccommodationFormDialog({
  open,
  onOpenChange,
  accommodation,
  onSuccess,
}: AccommodationFormDialogProps) {
  const isEditing = !!accommodation;

  const [formData, setFormData] = useState<AccommodationFormData>({
    name: '',
    type: 'APARTMENT',
    cityId: '',
    address: '',
    status: 'AVAILABLE',
    beds: 1,
    rooms: 1,
    ownerId: '',
  });
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch owners when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoadingOwners(true);
      fetch('/api/admin/users?role=OWNER&limit=100')
        .then((res) => res.json())
        .then((data) => {
          setOwners(data.users || []);
        })
        .catch((err) => {
          console.error('Error fetching owners:', err);
        })
        .finally(() => {
          setIsLoadingOwners(false);
        });
    }
  }, [open]);

  // Reset form when dialog opens/closes or accommodation changes
  useEffect(() => {
    if (open) {
      if (accommodation) {
        setFormData({
          name: accommodation.name || '',
          type: accommodation.type || 'APARTMENT',
          cityId: accommodation.cityId || '',
          address: accommodation.address || '',
          status: accommodation.status || 'AVAILABLE',
          beds: accommodation.beds || 1,
          rooms: accommodation.rooms || 1,
          ownerId: accommodation.owner?.id || '',
        });
      } else {
        setFormData({
          name: '',
          type: 'APARTMENT',
          cityId: '',
          address: '',
          status: 'AVAILABLE',
          beds: 1,
          rooms: 1,
          ownerId: '',
        });
      }
      setError(null);
    }
  }, [open, accommodation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/accommodations/${accommodation.id}`
        : '/api/admin/accommodations';

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Greška pri čuvanju');
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri čuvanju');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Izmeni smeštaj' : 'Dodaj smeštaj'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Naziv *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Unesite naziv smeštaja"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tip *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite tip" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOMMODATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite status" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOMMODATION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destinacija *</Label>
            <DestinationSelect
              value={formData.cityId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, cityId: value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresa *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Unesite adresu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerId">Vlasnik *</Label>
            <Select
              value={formData.ownerId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, ownerId: value }))}
              disabled={isLoadingOwners}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingOwners ? 'Učitavanje...' : 'Izaberite vlasnika'} />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rooms">Sobe</Label>
              <Input
                id="rooms"
                type="number"
                min="1"
                value={formData.rooms}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rooms: Number(e.target.value) || 1 }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beds">Ležaja</Label>
              <Input
                id="beds"
                type="number"
                min="1"
                value={formData.beds}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, beds: Number(e.target.value) || 1 }))
                }
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Otkaži
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.ownerId || !formData.cityId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Čuvanje...
                </>
              ) : isEditing ? (
                'Sačuvaj izmene'
              ) : (
                'Dodaj'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
