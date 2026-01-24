'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { User, Phone, Mail, MapPin, Save, Bell } from 'lucide-react';

export default function GuideSettingsPage() {
  const t = useTranslations('guideDashboard');
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '+381 60 123 4567',
    defaultMeetingPoint: 'Benzinska pumpa na ulazu u Polihrono',
    notifications: {
      newClient: true,
      clientDeparted: true,
      clientInGreece: true,
      clientArrived: true,
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // TODO: API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Saved settings:', formData);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('settings')}</h1>
        <p className="mt-2 text-foreground-muted">Upravljajte podešavanjima vašeg naloga</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Lični podaci
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Ime i prezime</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Broj telefona</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email adresa</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingPoint">Podrazumevano mesto sastanka</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                  id="meetingPoint"
                  value={formData.defaultMeetingPoint}
                  onChange={(e) => handleInputChange('defaultMeetingPoint', e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-foreground-muted">
                Ovo mesto će se automatski dodeliti novim klijentima
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Obaveštenja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novi klijent</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenje kada vam se dodeli novi klijent
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.newClient}
                  onChange={(e) => handleNotificationChange('newClient', e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Klijent krenuo</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenje kada klijent potvrdi polazak
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.clientDeparted}
                  onChange={(e) => handleNotificationChange('clientDeparted', e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Klijent u Grčkoj</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenje kada klijent pređe granicu
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.clientInGreece}
                  onChange={(e) => handleNotificationChange('clientInGreece', e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Klijent stigao</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenje kada klijent stigne na destinaciju
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.clientArrived}
                  onChange={(e) => handleNotificationChange('clientArrived', e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Čuvanje...' : 'Sačuvaj promene'}
          </Button>
        </div>
      </div>
    </div>
  );
}
