import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function Logo({ size = 'md', className, linkToHome = true }: LogoProps) {
  const content = (
    <span className={cn('font-bold tracking-tight', sizeClasses[size], className)}>
      <span className="text-primary">Ja To</span>
      <span className="text-foreground"> Mogu</span>
    </span>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
