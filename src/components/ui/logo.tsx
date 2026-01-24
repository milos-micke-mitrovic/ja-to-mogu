import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkToHome?: boolean;
  showText?: boolean;
}

const sizeConfig = {
  sm: { icon: 'h-6 w-6', text: 'text-lg' },
  md: { icon: 'h-8 w-8', text: 'text-xl' },
  lg: { icon: 'h-10 w-10', text: 'text-2xl' },
};

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="110" cy="110" r="80" fill="#F5B800" />
      <path
        d="M30 130 Q110 60 190 130"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="110" cy="110" r="55" fill="#FFD700" />
    </svg>
  );
}

export function Logo({ size = 'md', className, linkToHome = true, showText = true }: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoIcon className={config.icon} />
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
