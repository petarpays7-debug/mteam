'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { MountSceneFrame } from '@/components/three/SceneFrame';
import type { MountKind } from '@/components/three/MountScene';
import { Icon } from '@/components/ui/Icon';
import { Photo } from '@/components/ui/Photo';
import type { ExtraIconName } from '@/components/ui/Icon';
import { mountCategories } from '@/content/mount';
import { cn } from '@/lib/cn';

const icons: Record<string, ExtraIconName> = {
  'kosi-krov': 'roof-pitched',
  'limeni-krov': 'roof-metal',
  'ravni-krov': 'roof-flat',
  'ground-mount': 'ground',
  carport: 'carport',
  'solar-fence': 'fence',
};

function MountFallback({ slug }: { slug: string }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 45%, rgba(147,174,191,0.16), transparent 70%), linear-gradient(180deg, rgba(4,18,27,0) 0%, rgba(4,18,27,0.65) 100%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon name={icons[slug] ?? 'frame'} className="h-28 w-28 text-petrol-200/45" />
      </div>
    </div>
  );
}

/**
 * Pregled tipova konstrukcija. Kartice su implementirane kao ARIA tabovi:
 * strelice mijenjaju odabir, Home/End skacu na prvi i zadnji.
 */
export function MountExplorer() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const baseId = useId();
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const category = mountCategories[active];

  function focusTab(index: number) {
    const next = (index + mountCategories.length) % mountCategories.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTab(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTab(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(mountCategories.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-12">
      {/*
        `min-w-0` je nuzan: stupac mreze inace ne smije biti uzi od svog
        min-content sadrzaja, a `truncate` tekst u karticama ga u tom racunu
        drzi u jednom retku. Bez toga stranica na mobitelu ide u vodoravni
        pomak umjesto da se tekst skrati.

        Ljepilo je na popisu tipova, a ne na prikazu: prikaz je visi stupac i
        sam odreduje visinu retka, pa se nema uz sto zalijepiti. Popis je
        krac i ostaje dohvatljiv dok se prolazi kroz prikaz, fotografiju i
        opis. `lg:self-start` je uvjet — bez njega se stupac rastegne na punu
        visinu retka i `sticky` opet nema ucinka.
      */}
      <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <div
          role="tablist"
          aria-label="Tipovi solarnih konstrukcija"
          aria-orientation="vertical"
          className="flex flex-col gap-2"
        >
          {mountCategories.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.slug}
                ref={(node) => {
                  tabsRef.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.slug}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${item.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  'group flex items-center gap-4 rounded-card border px-5 py-4 text-left transition-all duration-400 ease-brand',
                  selected
                    ? 'border-solar/45 bg-solar/[0.08]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-400',
                    selected
                      ? 'border-solar/40 text-solar'
                      : 'border-white/12 text-paper/45 group-hover:text-paper/75',
                  )}
                >
                  <Icon name={icons[item.slug] ?? 'frame'} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block font-display text-[0.95rem] font-semibold tracking-tight transition-colors',
                      selected ? 'text-paper' : 'text-paper/75',
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.8rem] text-paper/45">
                    {item.short}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0">
        <MountSceneFrame
          kind={category.slug as MountKind}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-white/10 bg-petrol-900"
          fallback={<MountFallback slug={category.slug} />}
        />

        {/* Shematski 3D prikaz gore, stvarna fotografija te izvedbe odmah ispod. */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={`foto-${category.slug}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.12 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Photo
                photo={category.photo}
                ratio="16 / 9"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel-${category.slug}`}
          aria-labelledby={`${baseId}-tab-${category.slug}`}
          tabIndex={0}
          className="mt-5 rounded-card border border-white/10 bg-white/[0.025] p-7"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="font-display text-display-sm">{category.title}</h3>
              <ul className="mt-5 flex flex-col gap-2.5">
                {category.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-solar" />
                    <span className="text-sm leading-relaxed text-paper/65">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
