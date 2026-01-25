import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Logo, LogoIcon } from '@/components/ui';
import { auth } from '@/lib/auth';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  return <HomeContent user={session?.user} />;
}

interface HomeContentProps {
  user?: {
    name?: string | null;
    role?: string;
  };
}

function HomeContent({ user }: HomeContentProps) {
  const t = useTranslations('landing');
  const tNav = useTranslations('navigation');
  const tPackages = useTranslations('packages');

  // Determine dashboard URL based on role
  const getDashboardUrl = () => {
    switch (user?.role) {
      case 'ADMIN': return '/admin';
      case 'OWNER': return '/owner';
      case 'GUIDE': return '/guide';
      default: return '/dashboard';
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo - icon only on mobile, full on desktop */}
          <div className="flex items-center">
            <span className="sm:hidden">
              <Logo size="md" linkToHome={false} showText={false} />
            </span>
            <span className="hidden sm:block">
              <Logo size="lg" linkToHome={false} />
            </span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <span className="hidden text-sm text-foreground-muted sm:inline">
                  {user.name || 'Korisnik'}
                </span>
                <Link
                  href={getDashboardUrl()}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover sm:px-4"
                >
                  {tNav('dashboard')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground-muted hover:text-foreground"
                >
                  {tNav('login')}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover sm:px-4"
                >
                  {tNav('register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-background-secondary py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {t('heroTitle')}
              </h1>
              <p className="mt-4 text-xl font-semibold text-primary">{t('heroSubtitle')}</p>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-muted">
                {t('heroDescription')}
              </p>
              <p className="mt-8 text-2xl font-bold text-foreground">{t('heroCta')}</p>
            </div>

            {/* Promotional Video */}
            <div className="mx-auto mt-12 max-w-3xl">
              <div className="aspect-video overflow-hidden rounded-xl bg-secondary shadow-lg">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                >
                  <source src="/videos/welcome.mp4" type="video/mp4" />
                  Vaš pretraživač ne podržava video.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-foreground">{t('destinations')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">{t('halkidikiKasandra')}</h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  Polihrono, Kalitea, Hanioti, Pefkohori, Siviri
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">{t('halkidikiSitonija')}</h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  Nikiti, Neos Marmaras, Sarti, Vourvourou
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold text-foreground">{t('olimpskaRegija')}</h3>
                <p className="mt-2 text-sm text-foreground-muted">
                  Paralija, Olimpik Bič, Leptokarija, Platamona
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="bg-background-secondary py-16" id="packages">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold text-foreground">{tPackages('title')}</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* Basic Package */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <div className="bg-secondary p-6">
                  <h3 className="text-xl font-bold text-secondary-foreground">
                    {tPackages('basicPackage')}
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-primary">{tPackages('basicPrice')}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-foreground-muted">{tPackages('basicFeature1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-foreground-muted">{tPackages('basicFeature2')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-foreground-muted">{tPackages('basicFeature3')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-foreground-muted">{tPackages('basicFeature4')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bonus Package */}
              <div className="overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-lg">
                <div className="bg-primary p-6">
                  <h3 className="text-xl font-bold text-primary-foreground">
                    {tPackages('bonusPackage')}
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-primary-foreground">
                    {tPackages('bonusPrice')}
                  </p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-success"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-foreground-muted">{tPackages('bonusFeature1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium text-foreground">
                        {tPackages('bonusFeature2')}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Unique Service Message */}
            <div className="mt-12 text-center">
              <p className="text-lg text-foreground-muted">{t('uniqueService')}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{t('stressFreeSummer')}</p>
            </div>

            {/* CTA Button */}
            <div className="mt-12 text-center">
              <Link
                href={user ? getDashboardUrl() : '/register'}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary-hover"
              >
                {user ? tNav('dashboard') : t('registerCta')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-sm text-foreground-muted">
            <LogoIcon className="h-10 w-10" />
            <p>© {new Date().getFullYear()} Ja To Mogu. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
