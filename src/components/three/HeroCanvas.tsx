'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { WorldId } from '@/content/home';
import { useInViewport } from '@/hooks/useInViewport';
import { useIsLowPowerDevice, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { SceneFallback } from './SceneFallback';

/**
 * WebGL se ucitava tek kad hero udje u vidno polje, pa ne blokira LCP.
 * `ssr: false` osigurava da three.js ne zavrsi u posluzitejskom renderu.
 */
const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => null,
});

export function HeroCanvas({ world }: { world: WorldId }) {
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: '300px' });
  const webgl = useWebGLSupport();
  const reduced = usePrefersReducedMotion();
  const lowPower = useIsLowPowerDevice();
  const pageVisible = usePageVisible();

  const scrollProgress = useRef(0);
  const [sceneReady, setSceneReady] = useState(false);
  /* Ako preglednik izgubi WebGL kontekst, trajno se vracamo na staticki prikaz. */
  const [contextLost, setContextLost] = useState(false);

  /* Napredak scrolla kroz hero sekciju - citaju ga kamera i morph. */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const total = rect.height || 1;
      const passed = Math.min(Math.max(-rect.top, 0), total);
      scrollProgress.current = passed / total;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);

  /* Kratka odgoda nakon mounta - hero tekst se prikaze prije nego krene WebGL. */
  useEffect(() => {
    if (!inView || webgl !== 'supported') return;
    const id = window.setTimeout(() => setSceneReady(true), 120);
    return () => window.clearTimeout(id);
  }, [inView, webgl]);

  const showScene = sceneReady && webgl === 'supported' && !contextLost;


  return (
    /*
      Na uskim zaslonima hero je visok zbog sadrzaja, pa scena zauzima samo
      gornji dio - ostaje u kadru i renderira manju povrsinu.
      Donji gradijent zavrsava u boji pozadine stranice, pa nema vidljivog spoja.
    */
    <div ref={ref} className="absolute inset-x-0 top-0 h-[64svh] lg:inset-0 lg:h-auto">
      {/* Fallback je uvijek u DOM-u ispod scene: sluzi i kao pozadina i kao zamjena. */}
      <SceneFallback
        world={world}
        className={`transition-opacity duration-[900ms] ease-brand ${
          showScene ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {showScene ? (
        <div className="absolute inset-0 animate-fade-up">
          <HeroScene
            world={world}
            scrollProgress={scrollProgress}
            reduced={reduced}
            simplified={lowPower}
            active={inView && pageVisible}
            onContextLost={() => setContextLost(true)}
          />
        </div>
      ) : null}

      {/*
        Citljivost teksta: zatamnjenje je koncentrirano uz donji i lijevi rub,
        gdje se nalazi hero sadrzaj, pa gornji desni dio scene ostaje vidljiv.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(4,18,27,0.5)_0%,rgba(4,18,27,0.2)_16%,rgba(4,18,27,0.42)_44%,rgba(6,26,38,0.72)_68%,rgba(6,26,38,0.94)_88%,#061A26_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(6,26,38,0.78)_0%,rgba(6,26,38,0.34)_36%,transparent_58%)] lg:block"
      />
    </div>
  );
}
