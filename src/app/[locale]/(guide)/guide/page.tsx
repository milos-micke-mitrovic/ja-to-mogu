'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ArrowRight,
  Car,
  Flag,
  Check,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getWhatsAppLink, getViberLink, getGoogleMapsUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data
const mockStats = {
  todaysClients: 2,
  upcomingClients: 3,
  activeClients: 1,
  completedToday: 1,
};

const mockTodaysClients = [
  {
    id: '1',
    name: 'Marko Petrović',
    phone: '+381 60 123 4567',
    hasViber: true,
    hasWhatsApp: true,
    accommodation: {
      name: 'Apartman Sunce',
      address: 'Polihrono, Halkidiki',
      latitude: 39.9589,
      longitude: 23.7541,
    },
    arrivalTime: '18:00',
    journeyStatus: 'IN_GREECE',
    meetingPoint: 'Benzinska pumpa na ulazu u Polihrono',
    meetingLatitude: 39.9601,
    meetingLongitude: 23.7555,
  },
  {
    id: '2',
    name: 'Ana Jovanović',
    phone: '+381 63 987 6543',
    hasViber: true,
    hasWhatsApp: false,
    accommodation: {
      name: 'Vila Panorama',
      address: 'Polihrono, Halkidiki',
      latitude: 39.9601,
      longitude: 23.7555,
    },
    arrivalTime: '20:00',
    journeyStatus: 'DEPARTED',
    meetingPoint: 'Benzinska pumpa na ulazu u Polihrono',
    meetingLatitude: 39.9601,
    meetingLongitude: 23.7555,
  },
];

export default function GuideDashboardPage() {
  const t = useTranslations('guideDashboard');

  const getJourneyStatusIcon = (status: string) => {
    switch (status) {
      case 'DEPARTED':
        return Car;
      case 'IN_GREECE':
        return Flag;
      case 'ARRIVED':
        return Check;
      default:
        return Clock;
    }
  };

  const getJourneyStatusLabel = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return t('notStarted');
      case 'DEPARTED':
        return t('departed');
      case 'IN_GREECE':
        return t('inGreece');
      case 'ARRIVED':
        return t('arrived');
      default:
        return status;
    }
  };

  const getJourneyStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-muted text-foreground-muted';
      case 'DEPARTED':
        return 'bg-warning/10 text-warning';
      case 'IN_GREECE':
        return 'bg-primary/10 text-primary';
      case 'ARRIVED':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-foreground-muted';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('dashboard')}</h1>
        <p className="mt-2 text-foreground-muted">{t('welcomeBack')}</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('todaysClients')}</p>
              <p className="text-2xl font-bold">{mockStats.todaysClients}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('upcomingClients')}</p>
              <p className="text-2xl font-bold">{mockStats.upcomingClients}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Car className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('activeClients')}</p>
              <p className="text-2xl font-bold">{mockStats.activeClients}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Check className="h-6 w-6 text-foreground-muted" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">{t('completedToday')}</p>
              <p className="text-2xl font-bold">{mockStats.completedToday}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('todaysClients')}</CardTitle>
          <Link href="/guide/clients">
            <Button variant="ghost" size="sm" className="gap-2">
              {t('viewAllClients')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {mockTodaysClients.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-foreground-muted" />
              <p className="mt-4 text-foreground-muted">{t('noClients')}</p>
              <p className="text-sm text-foreground-muted">{t('noClientsDescription')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockTodaysClients.map((client) => {
                const StatusIcon = getJourneyStatusIcon(client.journeyStatus);
                return (
                  <div
                    key={client.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* Client Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Users className="h-5 w-5 text-foreground-muted" />
                          </div>
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-sm text-foreground-muted">{client.phone}</p>
                          </div>
                        </div>

                        {/* Accommodation & Time */}
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-foreground-muted">
                            <MapPin className="h-4 w-4" />
                            {client.accommodation.name}
                          </span>
                          <span className="flex items-center gap-1 text-foreground-muted">
                            <Clock className="h-4 w-4" />
                            {client.arrivalTime}
                          </span>
                          <span
                            className={cn(
                              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                              getJourneyStatusColor(client.journeyStatus)
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {getJourneyStatusLabel(client.journeyStatus)}
                          </span>
                        </div>

                        {/* Meeting Point */}
                        <div className="mt-3">
                          <p className="text-xs font-medium text-foreground-muted">Mesto sastanka:</p>
                          <p className="text-sm">{client.meetingPoint}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={getGoogleMapsUrl(client.meetingLatitude, client.meetingLongitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                        >
                          <MapPin className="h-4 w-4" />
                          Mapa
                        </a>
                        {client.hasViber && (
                          <a
                            href={getViberLink(client.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#7360F2]/10 px-3 py-2 text-sm font-medium text-[#7360F2] hover:bg-[#7360F2]/20"
                          >
                            <Phone className="h-4 w-4" />
                            Viber
                          </a>
                        )}
                        {client.hasWhatsApp && (
                          <a
                            href={getWhatsAppLink(client.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-2 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/20"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
