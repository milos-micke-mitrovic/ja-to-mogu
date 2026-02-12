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
  Separator,
} from '@/components/ui';
import { User, Phone, Mail, MapPin, Save, Bell, Lock, Loader2 } from 'lucide-react';
import { useApi } from '@/hooks';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
}

export default function ClientSettingsPage() {
  const t = useTranslations('navigation');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { data: profile, isLoading, refetch } = useApi<UserProfile>('/api/user/profile');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notifications: {
      bookingConfirmed: true,
      journeyReminder: true,
      promotions: false,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
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

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
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
          address: formData.address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Greška pri čuvanju');
      }

      refetch();
      toast.success('Podešavanja su sačuvana');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Greška pri čuvanju podešavanja');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Lozinke se ne poklapaju');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Nova lozinka mora imati najmanje 6 karaktera');
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Greška pri promeni lozinke');
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Lozinka je uspešno promenjena');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Greška pri promeni lozinke');
    } finally {
      setIsChangingPassword(false);
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
                  disabled
                  className="pl-10 opacity-60"
                />
              </div>
              <p className="text-xs text-foreground-muted">Email adresa se ne može promeniti</p>
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
                  <p className="font-medium">Potvrda rezervacije</p>
                  <p className="text-sm text-foreground-muted">
                    Obaveštenja o potvrdi i statusu vaših rezervacija
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.bookingConfirmed}
                  onCheckedChange={(checked) => handleNotificationChange('bookingConfirmed', !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Podsetnik za putovanje</p>
                  <p className="text-sm text-foreground-muted">
                    Podsetnici pre datuma polaska
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.journeyReminder}
                  onCheckedChange={(checked) => handleNotificationChange('journeyReminder', !!checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promocije i novosti</p>
                  <p className="text-sm text-foreground-muted">
                    Specijalne ponude i novosti o destinacijama
                  </p>
                </div>
                <Checkbox
                  checked={formData.notifications.promotions}
                  onCheckedChange={(checked) => handleNotificationChange('promotions', !!checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Promena lozinke
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Trenutna lozinka</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova lozinka</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                className="gap-2"
              >
                <Lock className="h-4 w-4" />
                {isChangingPassword ? 'Menjanje...' : 'Promeni lozinku'}
              </Button>
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
