/**
 * Potpis studija u podnožju.
 *
 * Na prelazak mišem udari grom: munja se povuče odozgo, dvaput bljesne i
 * ugasi se, a natpis u tom trenutku zasvijetli. Efekt je čisti CSS — nema
 * stanja ni JavaScripta, pa radi i prije hidracije.
 *
 * Bljeskovi su namjerno ograničeni na dva unutar sekunde i na sićušnu
 * površinu: WCAG 2.3.1 dopušta najviše tri bljeska u sekundi. Uz
 * `prefers-reduced-motion` munje nema uopće, ostaje samo promjena boje.
 */

/**
 * Poveznica na studio. Dok je prazna, potpis se prikazuje kao običan tekst —
 * radije bez poveznice nego s izmišljenom adresom.
 */
const STUDIO_URL = '';

function Bolt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 40"
      className="bolt pointer-events-none absolute -top-[2.15rem] left-1/2 h-9 w-[1.125rem] -translate-x-1/2 opacity-0"
    >
      <defs>
        <linearGradient id="oluja-bolt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF4D2" />
          <stop offset="45%" stopColor="#FFD65C" />
          <stop offset="100%" stopColor="#F5B900" />
        </linearGradient>
      </defs>
      <path d="M12.5 0 L4 22 L9.5 22 L7 40 L16 17 L10.5 17 Z" fill="url(#oluja-bolt)" />
    </svg>
  );
}

export function StudioCredit() {
  const content = (
    <>
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-paper/25 transition-colors duration-500 group-hover:text-paper/45">
        Designed &amp; developed by
      </span>

      <span className="relative mt-2 inline-block">
        {/* Odsjaj iza natpisa — ono što ostane kad munja prođe. */}
        <span aria-hidden className="bolt-glow pointer-events-none absolute -inset-x-6 -inset-y-4 opacity-0" />
        <Bolt />
        <span className="bolt-word relative font-display text-[0.95rem] font-semibold uppercase tracking-[0.42em] text-paper/45 transition-colors duration-500 group-hover:text-paper">
          Oluja
        </span>
      </span>
    </>
  );

  /* `studio-credit` nosi animaciju (vidi globals.css), `group` boje iz Tailwinda. */
  const className =
    'studio-credit group relative inline-flex flex-col items-center rounded-lg px-3 pb-1 pt-9 text-center';

  if (STUDIO_URL) {
    return (
      <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return <span className={className}>{content}</span>;
}
