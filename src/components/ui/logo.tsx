import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
  showText?: boolean;
}

const sizeConfig = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
};

function LogoIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt="Ja To Mogu"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

export function Logo({ size = 'md', className, linkToHome = true, showText = true }: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoIcon size={config.icon} />
      {showText && (
        <span className={cn('font-bold tracking-tight', config.text)}>
          <span className="text-primary">Ja To</span>
          <span className="text-foreground"> Mogu</span>
        </span>
      )}
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

export { LogoIcon };
