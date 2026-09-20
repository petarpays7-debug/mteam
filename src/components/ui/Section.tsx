import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Vertikalni ritam sekcije. */
  spacing?: 'default' | 'tight' | 'none';
  as?: 'section' | 'div' | 'article';
};

export function Section({
  id,
  children,
  className,
  spacing = 'default',
  as: Tag = 'section',
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'relative',
        spacing === 'default' && 'py-section',
        spacing === 'tight' && 'py-[clamp(3rem,6vw,5.5rem)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type HeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: 'left' | 'center';
  level?: 2 | 3;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = 'left',
  level = 2,
  className,
}: HeaderProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading className={cn(level === 2 ? 'text-display-md' : 'text-display-sm', 'max-w-3xl')}>
        {title}
      </Heading>
      {lede ? <div className={cn('lede', align === 'center' && 'mx-auto')}>{lede}</div> : null}
    </div>
  );
}
