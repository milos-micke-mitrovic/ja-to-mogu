'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Checkbox,
} from '@/components/ui';
import { User, Phone, Mail, MapPin, Save, Bell, Shield, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export default function OwnerSettingsPage() {
  const t = useTranslations('ownerDashboard');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current user profile
  const { data: profile, isLoading, refetch } = useApi<UserProfile>('/api/user/profile');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    receiveTimeFrom: '14:00',
    receiveTimeTo: '22:00',
    notifications: {
      newBooking: true,
      guestArrival: true,
      reviews: true,
    },
  });

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile]);

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
    setIsSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      refetch();
      toast.success('Podešavanja su sačuvana');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Greška pri čuvanju podešavanja');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <Checkbox
                  checked={formData.notifications.newBooking}
                  onCheckedChange={(checked) => handleNotificationChange('newBooking', !!checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dolazak gostiju</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenja kada gost potvrdi dolazak
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.guestArrival}
                  onCheckedChange={(checked) => handleNotificationChange('guestArrival', !!checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ocene</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenja o novim ocenama
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.reviews}
                  onCheckedChange={(checked) => handleNotificationChange('reviews', !!checked)}
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
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Čuvanje...' : 'Sačuvaj promene'}
          </Button>
        </div>
      </div>
    </div>
  );
}
