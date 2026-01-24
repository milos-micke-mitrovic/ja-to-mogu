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
import { User, Phone, Mail, MapPin, Save, Bell, Shield } from 'lucide-react';

export default function OwnerSettingsPage() {
  const t = useTranslations('ownerDashboard');
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '+30 697 123 4567',
    address: 'Polihrono, Halkidiki, Grčka',
    receiveTimeFrom: '14:00',
    receiveTimeTo: '22:00',
    notifications: {
      newBooking: true,
      guestArrival: true,
      reviews: true,
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
              <Label htmlFor="address">Adresa</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receive Time Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Vreme prijema gostiju
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-foreground-muted">
              Odredite u kom vremenskom periodu možete primiti goste
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="receiveTimeFrom">Od</Label>
                <Input
                  id="receiveTimeFrom"
                  type="time"
                  value={formData.receiveTimeFrom}
                  onChange={(e) => handleInputChange('receiveTimeFrom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiveTimeTo">Do</Label>
                <Input
                  id="receiveTimeTo"
                  type="time"
                  value={formData.receiveTimeTo}
                  onChange={(e) => handleInputChange('receiveTimeTo', e.target.value)}
                />
              </div>
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
                  <p className="font-medium">Nove rezervacije</p>
                  <p className="text-sm text-foreground-muted">
                    Primajte obaveštenja o novim rezervacijama
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.newBooking}
                  onChange={(e) => handleNotificationChange('newBooking', e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dolazak gostiju</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenja kada gost potvrdi dolazak
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.guestArrival}
                  onChange={(e) => handleNotificationChange('guestArrival', e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ocene</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenja o novim ocenama
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.reviews}
                  onChange={(e) => handleNotificationChange('reviews', e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-warning/50 bg-warning-light">
          <CardContent className="flex items-start gap-4 p-4">
            <Shield className="h-6 w-6 flex-shrink-0 text-warning" />
            <div>
              <h4 className="font-medium text-warning-foreground">Obaveza čuvanja rezervacije</h4>
              <p className="mt-1 text-sm text-warning-foreground/80">
                Kao vlasnik smeštaja obavezujete se da čuvate rezervaciju 36 sati od potvrde.
                U slučaju otkazivanja sa vaše strane, isplaćuje se kompenzacija od 20 EUR gostu.
              </p>
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
