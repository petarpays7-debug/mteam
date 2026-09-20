'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Smjer ulaska; uz reduced motion uvijek postaje cisti fade. */
  direction?: 'up' | 'left' | 'right' | 'none';
  as?: 'div' | 'li' | 'section' | 'article' | 'span';
};

const offsets = {
  up: { x: 0, y: 22 },
  left: { x: -22, y: 0 },
  right: { x: 22, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  as = 'div',
}: RevealProps) {
  const reduced = useReducedMotion();
  const offset = reduced ? offsets.none : offsets[direction];
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      /* Animacija se pokrece samo pri prvom ulasku u viewport. */
      viewport={{ once: true, margin: '-12% 0px -10% 0px' }}
      transition={{
        duration: reduced ? 0.25 : 0.7,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'ul' | 'ol';
  step?: number;
};

/** Pomocnik za liste - djeca se otkrivaju s malim pomakom. */
export function RevealGroup({ children, className, as: Tag = 'div', step = 0.08 }: StaggerProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : step } },
      }}
    >
      {children}
    </MotionTag>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};
