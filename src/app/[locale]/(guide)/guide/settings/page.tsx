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
import { User, Phone, Mail, MapPin, Save, Bell, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export default function GuideSettingsPage() {
  const t = useTranslations('guideDashboard');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading, refetch } = useApi<UserProfile>('/api/user/profile');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    defaultMeetingPoint: '',
    notifications: {
      newClient: true,
      clientDeparted: true,
      clientInGreece: true,
      clientArrived: true,
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
                <Checkbox
                  checked={formData.notifications.newClient}
                  onCheckedChange={(checked) => handleNotificationChange('newClient', !!checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Klijent krenuo</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenje kada klijent potvrdi polazak
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.clientDeparted}
                  onCheckedChange={(checked) => handleNotificationChange('clientDeparted', !!checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Klijent u Grčkoj</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenje kada klijent pređe granicu
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.clientInGreece}
                  onCheckedChange={(checked) => handleNotificationChange('clientInGreece', !!checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Klijent stigao</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenje kada klijent stigne na destinaciju
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.clientArrived}
                  onCheckedChange={(checked) => handleNotificationChange('clientArrived', !!checked)}
                />
              </div>
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
