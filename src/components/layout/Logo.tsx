import { cn } from '@/lib/cn';

/**
 * Wordmark M-Team. Znak je apstraktna "M" izvedena iz dva nagnuta
 * solarna modula - ista geometrija koja se pojavljuje u 3D sceni.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        role="img"
        aria-label="M-Team znak"
        focusable="false"
      >
        <rect x="1" y="1" width="30" height="30" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.22" />
        <path d="M8 22.5 L12.2 10.5 L16 18.5 L19.8 10.5 L24 22.5" fill="none" stroke="#F5B900" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.8 25.4 H23.2" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {!compact ? (
        <span className="font-display text-[1.05rem] font-bold leading-none tracking-tight">
          M-Team
          <span className="ml-1 align-top text-[0.6rem] font-semibold tracking-[0.18em] opacity-55">
            D.O.O.
          </span>
        </span>
      ) : null}
    </span>
  );
}
