import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';
import type { ExtraIconName } from './Icon';

type Variant = 'solar' | 'cars' | 'outline' | 'ghost' | 'light';
type Size = 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-display text-sm font-semibold tracking-tight transition-all duration-300 ease-brand disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  solar:
    'bg-solar text-petrol-900 hover:bg-solar-soft hover:shadow-glow active:translate-y-px',
  cars: 'bg-cars text-white hover:bg-cars-soft hover:shadow-carsglow active:translate-y-px',
  outline:
    'border border-white/20 bg-white/[0.03] text-paper hover:border-solar/60 hover:bg-solar/10 hover:text-paper active:translate-y-px',
  ghost: 'text-paper/75 hover:text-solar',
  light:
    'border border-petrol-800/15 bg-petrol-800 text-paper hover:bg-petrol-700 active:translate-y-px',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5',
  lg: 'h-13 px-7 text-[0.95rem] sm:h-14 sm:px-8',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: ExtraIconName;
  children: ReactNode;
  className?: string;
};

type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> & { href: string };

type ButtonElProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: ButtonLinkProps | ButtonElProps) {
  const { variant = 'solar', size = 'md', icon, children, className, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const inner = (
    <>
      <span>{children}</span>
      {icon ? (
        <Icon
          name={icon}
          className="h-4 w-4 transition-transform duration-300 ease-brand group-hover:translate-x-0.5"
        />
      ) : null}
    </>
  );

  if ('href' in props && props.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    const external = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:');

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...anchorRest}
        >
          {inner}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorRest}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
