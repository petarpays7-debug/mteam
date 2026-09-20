'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { HeroCanvas } from '@/components/three/HeroCanvas';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { heroDisclaimer, heroStats, worlds } from '@/content/home';
import type { WorldId } from '@/content/home';
import { cn } from '@/lib/cn';

const accentRing: Record<WorldId, string> = {
  solar: 'border-solar/70 bg-solar/12 text-solar',
  cars: 'border-cars-soft/70 bg-cars/12 text-cars-soft',
  mount: 'border-petrol-200/70 bg-petrol-200/10 text-petrol-100',
};

export function Hero() {
  const [world, setWorld] = useState<WorldId>('solar');
  const reduced = useReducedMotion();
  const active = worlds.find((w) => w.id === world) ?? worlds[0];

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 pt-[calc(var(--header-h)+2rem)] sm:pb-20"
      aria-labelledby="hero-naslov"
    >
      <HeroCanvas world={world} />

      <div className="shell relative z-10">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="eyebrow"
          >
            Energija. Mobilnost. Bez kompromisa.
          </motion.p>

          <motion.h1
            id="hero-naslov"
            initial={{ opacity: 0, y: reduced ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease }}
            className="mt-5 text-display-xl"
          >
            Pretvaramo sunce u{' '}
            <span className="relative whitespace-nowrap text-solar">
              vašu energiju.
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduced ? 0 : 0.8, delay: 0.7, ease }}
                className="absolute -bottom-1 left-0 h-px w-full origin-left bg-solar/45"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-paper/75 sm:text-lg"
          >
            Solarne elektrane, stručna podrška i pouzdana izvedba — od ideje do vlastite proizvodnje
            energije.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href="/kontakt" size="lg" icon="arrow-right">
              Zatražite besplatnu analizu
            </Button>
            <Button href="/usluge" size="lg" variant="outline" icon="arrow-up-right">
              Istražite rješenja
            </Button>
          </motion.div>
        </div>

        {/* Odabir triju poslovnih svjetova - upravlja i 3D scenom. */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.46, ease }}
          className="mt-12"
        >
          <div
            role="group"
            aria-label="Odaberite poslovnu cjelinu prikazanu u 3D sceni"
            className="flex flex-wrap gap-2"
          >
            {worlds.map((item) => {
              const isActive = item.id === world;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorld(item.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-display text-[0.8rem] font-semibold tracking-tight transition-all duration-300 ease-brand',
                    isActive
                      ? accentRing[item.id]
                      : 'border-white/12 bg-white/[0.03] text-paper/65 hover:border-white/25 hover:text-paper',
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.id === 'solar' ? 'Solar' : item.id === 'cars' ? 'M-CARS' : 'MT Mount'}
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 min-h-[3.25rem]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={active.id}
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                transition={{ duration: reduced ? 0.15 : 0.35, ease }}
                className="max-w-xl text-sm leading-relaxed text-paper/60"
              >
                <span className="font-display font-semibold text-paper/90">{active.claim}</span>{' '}
                {active.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tri kljucne vrijednosti */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.56, ease }}
          className="mt-10 border-t border-white/10 pt-7"
        >
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="eyebrow-muted">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="mt-1 block text-[0.82rem] leading-relaxed text-paper/50">
                    {stat.detail}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-2xl text-[0.78rem] leading-relaxed text-paper/40">
            {heroDisclaimer}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
