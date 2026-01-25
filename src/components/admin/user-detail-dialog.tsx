'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components/ui';
import { User, Mail, Phone, Calendar, Building2, Compass, Users } from 'lucide-react';
import { formatDate, getWhatsAppLink, getViberLink } from '@/lib/utils';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
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
  } | null;
}

export function UserDetailDialog({
  open,
  onOpenChange,
  user,
}: UserDetailDialogProps) {
  if (!user) return null;

  const isOwner = user.role === 'OWNER';
  const isGuide = user.role === 'GUIDE';

  const getRoleIcon = () => {
    if (isOwner) return <Users className="h-8 w-8 text-primary" />;
    if (isGuide) return <Compass className="h-8 w-8 text-primary" />;
    return <User className="h-8 w-8 text-primary" />;
  };

  const getRoleLabel = () => {
    if (isOwner) return 'Vlasnik';
    if (isGuide) return 'Vodič';
    return 'Korisnik';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Detalji {isOwner ? 'vlasnika' : isGuide ? 'vodiča' : 'korisnika'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {getRoleIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name || 'Bez imena'}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground-muted">{getRoleLabel()}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.isActive ? 'bg-success/10 text-success' : 'bg-muted text-foreground-muted'
                  }`}
                >
                  {user.isActive ? 'Aktivan' : 'Neaktivan'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-3 font-medium">Kontakt informacije</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-foreground-muted" />
                <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                  {user.email}
                </a>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-foreground-muted" />
                  <a href={`tel:${user.phone}`} className="hover:underline">
                    {user.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {isOwner && (
              <div className="rounded-lg border border-border p-4 text-center">
                <Building2 className="mx-auto h-5 w-5 text-foreground-muted" />
                <p className="mt-2 text-2xl font-bold">{user._count.accommodations}</p>
                <p className="text-sm text-foreground-muted">Smeštaja</p>
              </div>
            )}
            {isGuide && (
              <div className="rounded-lg border border-border p-4 text-center">
                <User className="mx-auto h-5 w-5 text-foreground-muted" />
                <p className="mt-2 text-2xl font-bold">{user._count.guidedBookings}</p>
                <p className="text-sm text-foreground-muted">Aktivnih klijenata</p>
              </div>
            )}
            <div className="rounded-lg border border-border p-4 text-center">
              <Calendar className="mx-auto h-5 w-5 text-foreground-muted" />
              <p className="mt-2 text-sm font-medium">{formatDate(user.createdAt)}</p>
              <p className="text-sm text-foreground-muted">Registrovan</p>
            </div>
          </div>

          {/* Communication Buttons */}
          {user.phone && (
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 font-medium">Brza komunikacija</h4>
              <div className="flex gap-2">
                <a
                  href={getViberLink(user.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 border-[#7360F2] text-[#7360F2] hover:bg-[#7360F2]/10">
                    Viber
                  </Button>
                </a>
                <a
                  href={getWhatsAppLink(user.phone)}
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
