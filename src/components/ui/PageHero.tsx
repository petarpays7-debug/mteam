import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  /** Dekorativni sadrzaj desno (npr. 3D scena). */
  visual?: ReactNode;
  tone?: 'solar' | 'cars' | 'mount';
};

const tones = {
  solar: 'radial-gradient(55% 60% at 78% 24%, rgba(245,185,0,0.16), transparent 68%)',
  cars: 'radial-gradient(55% 60% at 78% 28%, rgba(201,0,0,0.18), transparent 68%)',
  mount: 'radial-gradient(55% 60% at 78% 26%, rgba(147,174,191,0.16), transparent 68%)',
};

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  visual,
  tone = 'solar',
}: PageHeroProps) {
  return (
    <section className="grain relative overflow-hidden pb-[clamp(3rem,6vw,5rem)] pt-[calc(var(--header-h)+3.5rem)]">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: tones[tone] }} />
      <div
        aria-hidden
        className="tech-grid pointer-events-none absolute inset-0 opacity-[0.5] mask-fade-b"
      />

      <div className="shell relative">
        <div className={cn('grid items-center gap-12', Boolean(visual) && 'lg:grid-cols-[1.05fr_0.95fr]')}>
          <div className="animate-fade-up">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-5 text-display-lg">{title}</h1>
            {lede ? <p className="lede mt-6">{lede}</p> : null}
            {children ? <div className="mt-9">{children}</div> : null}
          </div>

          {visual ? <div className="relative">{visual}</div> : null}
        </div>
      </div>
    </section>
  );
}
