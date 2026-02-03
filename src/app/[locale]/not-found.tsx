import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Logo size="lg" linkToHome />
      <h1 className="mt-8 text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-xl text-foreground-muted">{t('title')}</p>
      <p className="mt-2 text-foreground-muted">{t('description')}</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary-hover"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
