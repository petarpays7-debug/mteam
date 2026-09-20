'use client';

import { useCallback, useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};
const alwaysFalse = () => false;

/**
 * Citanje media queryja bez setState u efektu.
 *
 * `useSyncExternalStore` je ovdje ispravan obrazac: vrijednost zivi u pregledniku,
 * a ne u React stanju, pa nema kaskadnog rendera nakon hidracije.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return noopSubscribe();
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return serverValue;
    return window.matchMedia(query).matches;
  }, [query, serverValue]);

  const getServerSnapshot = useCallback(() => serverValue, [serverValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Jedinstvena tocka za "smanjeni pokret" - koristi se i u DOM-u i u 3D sceni. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function useIsCompactViewport(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

function getLowCores(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator.hardwareConcurrency ?? 8) <= 4;
}

/** Gruba procjena slabijeg uredjaja - koristi se za pojednostavljenje 3D scene. */
export function useIsLowPowerDevice(): boolean {
  const compact = useIsCompactViewport();
  // Broj jezgri se ne mijenja tijekom zivota stranice, pa je pretplata prazna.
  const lowCores = useSyncExternalStore(noopSubscribe, getLowCores, alwaysFalse);

  return compact || lowCores;
}
