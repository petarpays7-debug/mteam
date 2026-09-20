'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Jednom kad udje u viewport, ostaje true (za lazy mount 3D scene). */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
};

export function useInViewport<T extends HTMLElement>({
  once = false,
  rootMargin = '200px',
  threshold = 0,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  // Bez IntersectionObservera sadrzaj se smatra vidljivim od pocetka.
  const [inView, setInView] = useState(
    () => typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}
