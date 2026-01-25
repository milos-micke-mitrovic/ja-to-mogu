'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components/ui';
import { User, Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import { formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';

interface ClientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    _count: {
      bookings: number;
    };
  } | null;
}

export function ClientDetailDialog({
  open,
  onOpenChange,
  client,
}: ClientDetailDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Detalji klijenta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{client.name || 'Bez imena'}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  client.isActive ? 'bg-success/10 text-success' : 'bg-muted text-foreground-muted'
                }`}
              >
                {client.isActive ? 'Aktivan' : 'Neaktivan'}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-3 font-medium">Kontakt informacije</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-foreground-muted" />
                <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-foreground-muted" />
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <BookOpen className="mx-auto h-5 w-5 text-foreground-muted" />
              <p className="mt-2 text-2xl font-bold">{client._count.bookings}</p>
              <p className="text-sm text-foreground-muted">Rezervacija</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <Calendar className="mx-auto h-5 w-5 text-foreground-muted" />
              <p className="mt-2 text-sm font-medium">{formatDate(client.createdAt)}</p>
              <p className="text-sm text-foreground-muted">Registrovan</p>
            </div>
          </div>

          {/* Communication Buttons */}
          {client.phone && (
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 font-medium">Brza komunikacija</h4>
              <div className="flex gap-2">
                <a
                  href={getViberLink(client.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 border-[#7360F2] text-[#7360F2] hover:bg-[#7360F2]/10">
                    Viber
                  </Button>
                </a>
                <a
                  href={getWhatsAppLink(client.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10">
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zatvori
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
