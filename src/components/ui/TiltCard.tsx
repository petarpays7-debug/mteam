'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/cn';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Jacina nagiba u stupnjevima. Drzimo je nisko da tekst ostane citljiv. */
  intensity?: number;
  glow?: 'solar' | 'cars' | 'cool' | 'none';
};

const glowColors = {
  solar: 'rgba(245,185,0,0.18)',
  cars: 'rgba(201,0,0,0.2)',
  cool: 'rgba(147,174,191,0.16)',
  none: 'transparent',
};

export function TiltCard({ children, className, intensity = 4, glow = 'solar' }: TiltCardProps) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springCfg = { stiffness: 180, damping: 24, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), springCfg);
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), springCfg);

  const gx = useTransform(px, (v) => `${(v * 100).toFixed(1)}%`);
  const gy = useTransform(py, (v) => `${(v * 100).toFixed(1)}%`);
  const glowBackground = useMotionTemplate`radial-gradient(45% 55% at ${gx} ${gy}, ${glowColors[glow]}, transparent 72%)`;

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={
        reduced
          ? undefined
          : { rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 900 }
      }
      className={cn('relative', className)}
    >
      {glow !== 'none' ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 ease-brand group-hover:opacity-100 group-focus-within:opacity-100"
          style={reduced ? { background: glowColors[glow] } : { background: glowBackground }}
        />
      ) : null}
      {children}
    </motion.div>
  );
}
