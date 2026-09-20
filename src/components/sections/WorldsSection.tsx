'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { TiltCard } from '@/components/ui/TiltCard';
import { worlds } from '@/content/home';
import type { World } from '@/content/home';
import { cn } from '@/lib/cn';

const accent = {
  solar: {
    glow: 'solar' as const,
    ring: 'group-hover:border-solar/45 group-focus-within:border-solar/45',
    text: 'text-solar',
    bar: 'bg-solar',
  },
  cars: {
    glow: 'cars' as const,
    ring: 'group-hover:border-cars-soft/50 group-focus-within:border-cars-soft/50',
    text: 'text-cars-soft',
    bar: 'bg-cars',
  },
  mount: {
    glow: 'cool' as const,
    ring: 'group-hover:border-petrol-200/50 group-focus-within:border-petrol-200/50',
    text: 'text-petrol-100',
    bar: 'bg-petrol-200',
  },
};

function WorldCard({ world, index }: { world: World; index: number }) {
  const tone = accent[world.accent];

  return (
    <Reveal delay={index * 0.08} className="h-full">
      <TiltCard glow={tone.glow} className="group h-full rounded-card">
        <Link
          href={world.href}
          className={cn(
            'relative flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.025] p-7 transition-colors duration-500 ease-brand sm:p-8',
            tone.ring,
          )}
        >
          <div
            aria-hidden
            className="tech-grid pointer-events-none absolute inset-0 bg-grid-sm opacity-[0.5] mask-fade-b"
          />

          <div className="relative flex items-center justify-between">
            <span
              className={cn(
                'inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04]',
                tone.text,
              )}
            >
              <Icon name={world.icon} className="h-6 w-6" />
            </span>
            <span className="eyebrow-muted">{world.eyebrow}</span>
          </div>

          <h3 className="relative mt-7 font-display text-xl font-semibold tracking-tight text-paper">
            {world.title}
          </h3>
          <p className={cn('relative mt-2 font-display text-sm font-medium', tone.text)}>
            {world.claim}
          </p>
          <p className="relative mt-4 flex-1 text-sm leading-relaxed text-paper/60">
            {world.description}
          </p>

          <span className="relative mt-8 inline-flex items-center gap-2 font-display text-sm font-semibold text-paper">
            Saznajte više
            <Icon
              name="arrow-right"
              className="h-4 w-4 transition-transform duration-300 ease-brand group-hover:translate-x-1"
            />
          </span>

          {/* Mikroanimacija: akcentna linija se izvlaci pri hoveru i fokusu. */}
          <span
            aria-hidden
            className={cn(
              'absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 ease-brand group-hover:scale-x-100 group-focus-within:scale-x-100',
              tone.bar,
            )}
          />
        </Link>
      </TiltCard>
    </Reveal>
  );
}

export function WorldsSection() {
  return (
    <section className="relative py-section" aria-labelledby="svjetovi-naslov">
      <div className="shell">
        <SectionHeader
          eyebrow="Tri poslovna svijeta"
          title={<span id="svjetovi-naslov">Jedna tvrtka, tri područja odgovornosti.</span>}
          lede="Energija, mobilnost i konstrukcije razvijaju se pod istim standardom izvedbe i iste obveze prema klijentu."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {worlds.map((world, index) => (
            <WorldCard key={world.id} world={world} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
