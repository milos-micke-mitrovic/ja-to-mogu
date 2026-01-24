'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
} from '@/components/ui';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { AuthHeader } from '@/components/layouts/auth-header';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('Nevažeći link za verifikaciju.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(result.message || 'Email uspešno verifikovan!');
        } else {
          setStatus('error');
          setMessage(result.error || 'Greška pri verifikaciji emaila.');
        }
      } catch {
        setStatus('error');
        setMessage('Greška pri verifikaciji emaila.');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <AuthHeader />
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Verifikacija u toku...</h2>
            <p className="mt-2 text-foreground-muted">
              Molimo sačekajte dok verifikujemo vašu email adresu.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <AuthHeader />
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold">Email verifikovan!</h2>
            <p className="mt-2 text-foreground-muted">{message}</p>
            <p className="mt-4 text-sm text-foreground-muted">
              Sada možete koristiti sve funkcije platforme.
            </p>
            <Link href="/login" className="mt-6">
              <Button className="gap-2">Prijava</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <AuthHeader />
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
              <Mail className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-xl font-semibold">Nevažeći link</h2>
            <p className="mt-2 text-foreground-muted">{message}</p>
            <p className="mt-4 text-sm text-foreground-muted">
              Proverite da li ste kliknuli na ispravan link iz emaila.
            </p>
            <Link href="/login" className="mt-6">
              <Button variant="outline" className="gap-2">
                Nazad na prijavu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h2 className="text-xl font-semibold text-error">Greška</h2>
          <p className="mt-2 text-foreground-muted">{message}</p>
          <p className="mt-4 text-sm text-foreground-muted">
            Link za verifikaciju je možda istekao. Prijavite se i zatražite novi.
          </p>
          <Link href="/login" className="mt-6">
            <Button variant="outline" className="gap-2">
              Nazad na prijavu
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
