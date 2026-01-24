import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Ja To Mogu - Last Minute Smeštaj u Grčkoj',
    template: '%s | Ja To Mogu',
  },
  description:
    'Rezervišite smeštaj u Grčkoj za danas ili sutra. Halkidiki, Olimpska regija. Brza rezervacija, vodič na terenu, siguran smeštaj.',
  keywords: [
    'smeštaj Grčka',
    'Halkidiki',
    'Kasandra',
    'Sitonija',
    'Paralija',
    'last minute',
    'apartmani',
    'letovanje',
  ],
  authors: [{ name: 'Ja To Mogu' }],
  creator: 'Ja To Mogu',
  openGraph: {
    type: 'website',
    locale: 'sr_RS',
    url: 'https://jatomogu.rs',
    siteName: 'Ja To Mogu',
    title: 'Ja To Mogu - Last Minute Smeštaj u Grčkoj',
    description:
      'Rezervišite smeštaj u Grčkoj za danas ili sutra. Halkidiki, Olimpska regija. Brza rezervacija, vodič na terenu, siguran smeštaj.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
