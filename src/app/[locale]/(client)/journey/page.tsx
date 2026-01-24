'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from '@/components/ui';
import {
  Car,
  Flag,
  MapPin,
  Check,
  Phone,
  MessageCircle,
  ExternalLink,
  Home,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getWhatsAppLink, getViberLink, getGoogleMapsUrl } from '@/lib/utils';

type JourneyStatus = 'NOT_STARTED' | 'DEPARTED' | 'IN_GREECE' | 'ARRIVED';

// Mock booking data - will be fetched from API
const mockBooking = {
  id: '1',
  accommodation: {
    name: 'Apartman Sunce',
    address: 'Polihrono, Halkidiki',
    latitude: 39.9589,
    longitude: 23.7541,
    ownerName: 'Nikos Papadopoulos',
    ownerPhone: '+30 697 123 4567',
  },
  guide: {
    name: 'Marko Petrović',
    phone: '+381 60 123 4567',
    meetingPoint: 'Benzinska pumpa na ulazu u Polihrono',
    latitude: 39.9601,
    longitude: 23.7555,
  },
  hasGuide: true,
  arrivalDate: 'Danas',
  arrivalTime: '18:00',
};

export default function JourneyPage() {
  const t = useTranslations('journey');
  const tDashboard = useTranslations('dashboard');

  const [journeyStatus, setJourneyStatus] = useState<JourneyStatus>('NOT_STARTED');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusSteps = [
    {
      status: 'DEPARTED' as const,
      icon: Car,
      title: t('departed'),
      description: t('departedDescription'),
    },
    {
      status: 'IN_GREECE' as const,
      icon: Flag,
      title: t('arrivedGreece'),
      description: t('arrivedGreeceDescription'),
    },
    {
      status: 'ARRIVED' as const,
      icon: MapPin,
      title: t('arrivedDestination'),
      description: t('arrivedDestinationDescription'),
      hasSound: true,
    },
  ];

  const getStatusIndex = (status: JourneyStatus): number => {
    switch (status) {
      case 'NOT_STARTED':
        return -1;
      case 'DEPARTED':
        return 0;
      case 'IN_GREECE':
        return 1;
      case 'ARRIVED':
        return 2;
      default:
        return -1;
    }
  };

  const currentIndex = getStatusIndex(journeyStatus);

  const handleStatusUpdate = async (newStatus: JourneyStatus) => {
    setIsUpdating(true);

    try {
      // TODO: Make API call to update journey status
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Play sound for arrival
      if (newStatus === 'ARRIVED') {
        const audio = new Audio('/sounds/arrival.mp3');
        audio.play().catch(() => {
          // Ignore audio play errors
        });
      }

      setJourneyStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const canActivate = (stepIndex: number): boolean => {
    // Can only activate the next step in sequence
    return stepIndex === currentIndex + 1;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-foreground-muted">{t('statusDescription')}</p>
      </div>

      {/* Journey Status Tracker */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status putovanja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const canClick = canActivate(index);

              return (
                <div key={step.status} className="flex items-start gap-4">
                  {/* Status Light (Lampica) */}
                  <button
                    onClick={() => canClick && handleStatusUpdate(step.status)}
                    disabled={!canClick || isUpdating}
                    className={cn(
                      'relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-all',
                      isCompleted
                        ? 'bg-success text-white'
                        : canClick
                          ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
                          : 'bg-muted text-foreground-muted',
                      canClick && !isUpdating && 'cursor-pointer',
                      isCurrent && 'ring-4 ring-success/30'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                    {/* Pulse animation for active button */}
                    {canClick && !isUpdating && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-25" />
                    )}
                  </button>

                  {/* Step Info */}
                  <div className="flex-1 pt-2">
                    <h3
                      className={cn(
                        'font-semibold',
                        isCompleted ? 'text-success' : 'text-foreground'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-foreground-muted">{step.description}</p>
                    {isCompleted && (
                      <p className="mt-2 text-sm font-medium text-success">
                        {t('confirmed')}
                      </p>
                    )}
                    {canClick && !isUpdating && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleStatusUpdate(step.status)}
                      >
                        Potvrdi
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accommodation Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            {tDashboard('accommodationInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{mockBooking.accommodation.name}</h3>
            <p className="text-sm text-foreground-muted">{mockBooking.accommodation.address}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={getGoogleMapsUrl(
                mockBooking.accommodation.latitude,
                mockBooking.accommodation.longitude
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
            >
              <MapPin className="h-4 w-4" />
              Otvori lokaciju
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="border-t pt-4">
            <p className="mb-2 text-sm font-medium">Vlasnik smeštaja</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-foreground-muted" />
              </div>
              <div>
                <p className="font-medium">{mockBooking.accommodation.ownerName}</p>
                <p className="text-sm text-foreground-muted">
                  {mockBooking.accommodation.ownerPhone}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Info (if Bonus package) */}
      {mockBooking.hasGuide && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {tDashboard('guideInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{mockBooking.guide.name}</p>
                <p className="text-sm text-foreground-muted">{mockBooking.guide.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground-muted">Mesto sastanka</p>
              <p className="mt-1">{mockBooking.guide.meetingPoint}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={getGoogleMapsUrl(mockBooking.guide.latitude, mockBooking.guide.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
              >
                <MapPin className="h-4 w-4" />
                Lokacija sastanka
              </a>
              <a
                href={getViberLink(mockBooking.guide.phone)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#7360F2]/10 px-3 py-2 text-sm font-medium text-[#7360F2] hover:bg-[#7360F2]/20"
              >
                <Phone className="h-4 w-4" />
                Viber
              </a>
              <a
                href={getWhatsAppLink(mockBooking.guide.phone)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-2 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/20"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
