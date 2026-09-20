'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useInViewport } from '@/hooks/useInViewport';
import { useIsLowPowerDevice, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import type { MountKind } from './MountScene';

const MountScene = dynamic(() => import('./MountScene'), { ssr: false, loading: () => null });
const CarScene = dynamic(() => import('./CarScene'), { ssr: false, loading: () => null });

type FrameState = {
  reduced: boolean;
  simplified: boolean;
  active: boolean;
};

type SceneGate = {
  ref: ReturnType<typeof useInViewport<HTMLDivElement>>['ref'];
  show: boolean;
  state: FrameState;
  onContextLost: () => void;
};

function useSceneGate(): SceneGate {
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: '250px' });
  const webgl = useWebGLSupport();
  const reduced = usePrefersReducedMotion();
  const simplified = useIsLowPowerDevice();
  const pageVisible = usePageVisible();
  const [ready, setReady] = useState(false);
  /* Gubitak WebGL konteksta trajno vraca staticki prikaz. */
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    if (!inView || webgl !== 'supported') return;
    const id = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(id);
  }, [inView, webgl]);

  const state: FrameState = {
    reduced,
    simplified,
    active: inView && pageVisible,
  };

  return {
    ref,
    show: ready && webgl === 'supported' && !contextLost,
    state,
    onContextLost: () => setContextLost(true),
  };
}

/**
 * Omotac koji lijeno ucitava WebGL scenu i prikazuje zadani fallback
 * dok scena nije spremna ili ako WebGL nije podrzan.
 */
export function MountSceneFrame({
  kind,
  fallback,
  className,
}: {
  kind: MountKind;
  fallback: ReactNode;
  className?: string;
}) {
  const { ref, show, state, onContextLost } = useSceneGate();

  return (
    <div ref={ref} className={className}>
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-brand ${
          show ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {fallback}
      </div>
      {show ? (
        <div className="absolute inset-0">
          <MountScene kind={kind} {...state} onContextLost={onContextLost} />
        </div>
      ) : null}
    </div>
  );
}

export function CarSceneFrame({
  fallback,
  className,
}: {
  fallback: ReactNode;
  className?: string;
}) {
  const { ref, show, state, onContextLost } = useSceneGate();

  return (
    <div ref={ref} className={className}>
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-brand ${
          show ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {fallback}
      </div>
      {show ? (
        <div className="absolute inset-0">
          <CarScene {...state} onContextLost={onContextLost} />
        </div>
      ) : null}
    </div>
  );
}
