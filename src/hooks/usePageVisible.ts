'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function getSnapshot(): boolean {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible';
}

/**
 * Prati je li kartica preglednika aktivna.
 * Koristi se za pauziranje WebGL render petlje kad korisnik nije na stranici.
 */
const serverSnapshot = () => true;

export function usePageVisible(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}
