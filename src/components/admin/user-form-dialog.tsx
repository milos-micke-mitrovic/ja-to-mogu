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
  Checkbox,
} from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
  } | null;
  role: 'OWNER' | 'GUIDE';
  onSuccess: () => void;
}

const roleLabels = {
  OWNER: { singular: 'vlasnika', title: 'Vlasnik' },
  GUIDE: { singular: 'vodiča', title: 'Vodič' },
};

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  role,
  onSuccess,
}: UserFormDialogProps) {
  const isEditing = !!user;
  const labels = roleLabels[role];

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
          isActive: user.isActive,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          isActive: true,
        });
      }
      setError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/users/${user.id}`
        : '/api/admin/users';

      const body: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        isActive: formData.isActive,
      };

      if (!isEditing) {
        body.role = role;
        body.password = formData.password;
      } else if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Izmeni ${labels.singular}` : `Dodaj ${labels.singular}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Ime i prezime *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Unesite ime i prezime"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+381 60 123 4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? 'Nova lozinka (ostavite prazno za zadržavanje trenutne)' : 'Lozinka *'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required={!isEditing}
              minLength={6}
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked === true }))
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Aktivan nalog
            </Label>
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
            <Button type="submit" disabled={isSubmitting}>
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
