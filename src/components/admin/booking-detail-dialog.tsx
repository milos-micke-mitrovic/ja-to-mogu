'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components/ui';
import {
  User,
  Building2,
  Calendar,
  Compass,
  CreditCard,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const JOURNEY_STATUS_ORDER = ['NOT_STARTED', 'DEPARTED', 'IN_GREECE', 'ARRIVED'] as const;

const getNextJourneyStatus = (current: string) => {
  const currentIndex = JOURNEY_STATUS_ORDER.indexOf(current as typeof JOURNEY_STATUS_ORDER[number]);
  if (currentIndex === -1 || currentIndex >= JOURNEY_STATUS_ORDER.length - 1) return null;
  return JOURNEY_STATUS_ORDER[currentIndex + 1];
};

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (bookingId: string, action: { status?: string; journeyStatus?: string }) => Promise<void>;
  booking: {
    id: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    hasViber: boolean;
    hasWhatsApp: boolean;
    status: string;
    journeyStatus: string;
    packageType: string;
    totalPrice: number;
    arrivalDate: string;
    arrivalTime: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
    accommodation: {
      id: string;
      name: string;
      city?: { name: string };
      address: string;
      owner: {
        id: string;
        name: string;
        phone: string | null;
      };
    };
    guide: {
      id: string;
      name: string;
      phone: string | null;
    } | null;
  } | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-warning/10 text-warning';
    case 'CONFIRMED':
      return 'bg-success/10 text-success';
    case 'COMPLETED':
      return 'bg-muted text-foreground-muted';
    case 'CANCELLED':
      return 'bg-error/10 text-error';
    default:
      return 'bg-muted text-foreground-muted';
  }
};

export function BookingDetailDialog({
  open,
  onOpenChange,
  onAction,
  booking,
}: BookingDetailDialogProps) {
  const t = useTranslations('admin');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return t('statusPending');
      case 'CONFIRMED':
        return t('statusConfirmed');
      case 'COMPLETED':
        return t('statusCompleted');
      case 'CANCELLED':
        return t('statusCancelled');
      default:
        return status;
    }
  };

  const getJourneyStatusLabel = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return t('journeyNotStarted');
      case 'DEPARTED':
        return t('journeyDeparted');
      case 'IN_GREECE':
        return t('journeyInGreece');
      case 'ARRIVED':
        return t('journeyArrived');
      default:
        return status;
    }
  };

  const getJourneyActionLabel = (status: string) => {
    switch (status) {
      case 'DEPARTED':
        return t('journeyDepartedAction');
      case 'IN_GREECE':
        return t('journeyInGreeceAction');
      case 'ARRIVED':
        return t('journeyArrivedAction');
      default:
        return status;
    }
  };

  if (!booking) return null;

  const handleAction = async (action: { status?: string; journeyStatus?: string }) => {
    if (!onAction) return;
    const actionKey = action.status || action.journeyStatus || '';
    setLoadingAction(actionKey);
    try {
      await onAction(booking.id, action);
      toast.success(t('bookingUpdated'));
    } catch {
      toast.error(t('bookingUpdateError'));
    } finally {
      setLoadingAction(null);
    }
  };

  const nextJourneyStatus = getNextJourneyStatus(booking.journeyStatus);
  const showStatusActions = onAction && (booking.status === 'PENDING' || booking.status === 'CONFIRMED');
  const showJourneyActions = onAction && booking.status === 'CONFIRMED' && nextJourneyStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('bookingDetails')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  getStatusColor(booking.status)
                )}
              >
                {getStatusLabel(booking.status)}
              </span>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  booking.packageType === 'BONUS'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-foreground-muted'
                )}
              >
                {booking.packageType}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatPrice(booking.totalPrice)}
              </p>
            </div>
          </div>

          {/* Guest Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <User className="h-4 w-4" />
              {t('guestData')}
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('name')}:</span>
                <span className="font-medium">{booking.guestName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('email')}:</span>
                <span>{booking.guestEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('phone')}:</span>
                <span>{booking.guestPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('communication')}:</span>
                <div className="flex gap-2">
                  {booking.hasViber && (
                    <span className="rounded bg-[#7360F2]/10 px-2 py-0.5 text-xs text-[#7360F2]">
                      Viber
                    </span>
                  )}
                  {booking.hasWhatsApp && (
                    <span className="rounded bg-[#25D366]/10 px-2 py-0.5 text-xs text-[#25D366]">
                      WhatsApp
                    </span>
                  )}
                  {!booking.hasViber && !booking.hasWhatsApp && (
                    <span className="text-foreground-muted">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Accommodation Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4" />
              {t('accommodation')}
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('name')}:</span>
                <span className="font-medium">{booking.accommodation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('destination')}:</span>
                <span>{booking.accommodation.city?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('address')}:</span>
                <span>{booking.accommodation.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('owner')}:</span>
                <span>{booking.accommodation.owner.name}</span>
              </div>
              {booking.accommodation.owner.phone && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">{t('ownerPhone')}:</span>
                  <span>{booking.accommodation.owner.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Travel Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4" />
              {t('travelDetails')}
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('arrivalDate')}:</span>
                <span className="font-medium">{formatDate(booking.arrivalDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('arrivalTime')}:</span>
                <span>{booking.arrivalTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('journeyStatus')}:</span>
                <span>{getJourneyStatusLabel(booking.journeyStatus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('createdAt')}:</span>
                <span>{formatDate(booking.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Guide Info (if BONUS package) */}
          {booking.packageType === 'BONUS' && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-3 flex items-center gap-2 font-medium">
                <Compass className="h-4 w-4" />
                {t('guideSection')}
              </h3>
              {booking.guide ? (
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">{t('name')}:</span>
                    <span className="font-medium">{booking.guide.name}</span>
                  </div>
                  {booking.guide.phone && (
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">{t('phone')}:</span>
                      <span>{booking.guide.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">{t('guideNotAssigned')}</p>
              )}
            </div>
          )}

          {/* Registered User Info */}
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2 font-medium">
              <CreditCard className="h-4 w-4" />
              {t('registeredUser')}
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('name')}:</span>
                <span>{booking.user.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">{t('email')}:</span>
                <span>{booking.user.email}</span>
              </div>
              {booking.user.phone && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted">{t('phone')}:</span>
                  <span>{booking.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {(showStatusActions || showJourneyActions) && (
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            {showStatusActions && (
              <div className="flex flex-wrap gap-2">
                {booking.status === 'PENDING' && (
                  <Button
                    className="bg-success text-white hover:bg-success/90"
                    loading={loadingAction === 'CONFIRMED'}
                    disabled={loadingAction !== null}
                    onClick={() => handleAction({ status: 'CONFIRMED' })}
                  >
                    {t('confirmAction')}
                  </Button>
                )}
                {booking.status === 'CONFIRMED' && (
                  <Button
                    variant="outline"
                    loading={loadingAction === 'COMPLETED'}
                    disabled={loadingAction !== null}
                    onClick={() => handleAction({ status: 'COMPLETED' })}
                  >
                    {t('completeAction')}
                  </Button>
                )}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <Button
                    variant="destructive"
                    loading={loadingAction === 'CANCELLED'}
                    disabled={loadingAction !== null}
                    onClick={() => handleAction({ status: 'CANCELLED' })}
                  >
                    {t('cancelAction')}
                  </Button>
                )}
              </div>
            )}
            {showJourneyActions && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-foreground-muted">{t('travel')}:</span>
                <Button
                  variant="outline"
                  size="sm"
                  loading={loadingAction === nextJourneyStatus}
                  disabled={loadingAction !== null}
                  onClick={() => handleAction({ journeyStatus: nextJourneyStatus })}
                >
                  {getJourneyActionLabel(nextJourneyStatus)}
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
