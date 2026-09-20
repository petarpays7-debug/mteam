'use client';

import { useSyncExternalStore } from 'react';

export type WebGLState = 'checking' | 'supported' | 'unsupported';

let cached: WebGLState | null = null;

function detect(): WebGLState {
  if (cached) return cached;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    cached = gl ? 'supported' : 'unsupported';
  } catch {
    cached = 'unsupported';
  }
  return cached;
}

/**
 * Provjera podrske za WebGL kako bi se mogao prikazati staticki fallback.
 * Rezultat se racuna jednom i dijeli izmedju svih scena na stranici.
 */
/* Stabilne reference - inline funkcije bi izazvale pretplatu pri svakom renderu. */
const noopSubscribe = () => () => {};
const serverSnapshot = (): WebGLState => 'checking';

export function useWebGLSupport(): WebGLState {
  return useSyncExternalStore(noopSubscribe, detect, serverSnapshot);
}
