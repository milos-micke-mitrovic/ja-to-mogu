'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Users,
  Search,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Car,
  Flag,
  Check,
  Calendar,
  Home,
  ExternalLink,
} from 'lucide-react';
import { formatDate, getWhatsAppLink, getViberLink, getGoogleMapsUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data
const mockClients = [
  {
    id: '1',
    name: 'Marko Petrović',
    phone: '+381 60 123 4567',
    email: 'marko@email.com',
    hasViber: true,
    hasWhatsApp: true,
    accommodation: {
      name: 'Apartman Sunce',
      address: 'Polihrono, Halkidiki',
      latitude: 39.9589,
      longitude: 23.7541,
    },
    arrivalDate: '2024-07-20',
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
    email: 'ana@email.com',
    hasViber: true,
    hasWhatsApp: false,
    accommodation: {
      name: 'Vila Panorama',
      address: 'Polihrono, Halkidiki',
      latitude: 39.9601,
      longitude: 23.7555,
    },
    arrivalDate: '2024-07-20',
    arrivalTime: '20:00',
    journeyStatus: 'DEPARTED',
    meetingPoint: 'Benzinska pumpa na ulazu u Polihrono',
    meetingLatitude: 39.9601,
    meetingLongitude: 23.7555,
  },
  {
    id: '3',
    name: 'Nikola Nikolić',
    phone: '+381 64 555 1234',
    email: 'nikola@email.com',
    hasViber: false,
    hasWhatsApp: true,
    accommodation: {
      name: 'Studio More',
      address: 'Polihrono, Halkidiki',
      latitude: 39.9575,
      longitude: 23.7530,
    },
    arrivalDate: '2024-07-21',
    arrivalTime: '14:00',
    journeyStatus: 'NOT_STARTED',
    meetingPoint: 'Benzinska pumpa na ulazu u Polihrono',
    meetingLatitude: 39.9601,
    meetingLongitude: 23.7555,
  },
  {
    id: '4',
    name: 'Jovana Đorđević',
    phone: '+381 65 111 2222',
    email: 'jovana@email.com',
    hasViber: true,
    hasWhatsApp: true,
    accommodation: {
      name: 'Apartman Sunce',
      address: 'Polihrono, Halkidiki',
      latitude: 39.9589,
      longitude: 23.7541,
    },
    arrivalDate: '2024-07-19',
    arrivalTime: '16:00',
    journeyStatus: 'ARRIVED',
    meetingPoint: 'Benzinska pumpa na ulazu u Polihrono',
    meetingLatitude: 39.9601,
    meetingLongitude: 23.7555,
  },
];

export default function GuideClientsPage() {
  const t = useTranslations('guideDashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.accommodation.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || client.journeyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('clients')}</h1>
        <p className="mt-2 text-foreground-muted">
          Pregledajte sve dodeljene klijente i pratite njihov status putovanja
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Pretraži po imenu ili smeštaju..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status putovanja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="NOT_STARTED">{t('notStarted')}</SelectItem>
                <SelectItem value="DEPARTED">{t('departed')}</SelectItem>
                <SelectItem value="IN_GREECE">{t('inGreece')}</SelectItem>
                <SelectItem value="ARRIVED">{t('arrived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium">{t('noClients')}</h3>
          <p className="mt-2 text-foreground-muted">{t('noClientsDescription')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => {
            const StatusIcon = getJourneyStatusIcon(client.journeyStatus);
            const isExpanded = expandedClient === client.id;

            return (
              <Card key={client.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Main Info */}
                  <div
                    className="flex cursor-pointer flex-col gap-4 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                    onClick={() =>
                      setExpandedClient(isExpanded ? null : client.id)
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Users className="h-6 w-6 text-foreground-muted" />
                      </div>
                      <div>
                        <p className="font-semibold">{client.name}</p>
                        <p className="text-sm text-foreground-muted">{client.accommodation.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(client.arrivalDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {client.arrivalTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                          getJourneyStatusColor(client.journeyStatus)
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {getJourneyStatusLabel(client.journeyStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 p-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Client Contact */}
                        <div>
                          <h4 className="mb-3 font-semibold">Kontakt podaci</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-foreground-muted" />
                              <span>{client.phone}</span>
                            </div>
                          </div>

                          {/* Contact Options */}
                          <div className="mt-4 flex flex-wrap gap-2">
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

                        {/* Accommodation & Meeting */}
                        <div>
                          <h4 className="mb-3 font-semibold">Smeštaj i mesto sastanka</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                              <Home className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground-muted" />
                              <div>
                                <p className="font-medium">{client.accommodation.name}</p>
                                <p className="text-foreground-muted">{client.accommodation.address}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground-muted" />
                              <div>
                                <p className="font-medium">Mesto sastanka</p>
                                <p className="text-foreground-muted">{client.meetingPoint}</p>
                              </div>
                            </div>
                          </div>

                          {/* Map Links */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <a
                              href={getGoogleMapsUrl(client.meetingLatitude, client.meetingLongitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                            >
                              <MapPin className="h-4 w-4" />
                              Mesto sastanka
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <a
                              href={getGoogleMapsUrl(
                                client.accommodation.latitude,
                                client.accommodation.longitude
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-muted/80"
                            >
                              <Home className="h-4 w-4" />
                              Smeštaj
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
