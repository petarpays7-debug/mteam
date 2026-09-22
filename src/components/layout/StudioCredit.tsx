/**
 * Potpis studija u podnožju.
 *
 * Na prelazak mišem kroz sama slova „OLUJA" proleti bljesak — svjetlo je
 * ograničeno na oblik slova (`background-clip: text`, ista tehnika kao sun
 * sweep u herou), pa izgleda kao da slova gore iznutra, a ne kao da je preko
 * njih položen sjaj.
 *
 * Efekt je čisti CSS: nema stanja ni JavaScripta, pa radi i prije hidracije.
 *
 * Bljeska je namjerno točno dva unutar sekunde i na sićušnoj površini —
 * WCAG 2.3.1 dopušta najviše tri u sekundi. Uz `prefers-reduced-motion`
 * bljeska nema, ostaje samo promjena boje.
 */

/**
 * Poveznica na studio. Dok je prazna, potpis se prikazuje kao običan tekst —
 * radije bez poveznice nego s izmišljenom adresom.
 */
const STUDIO_URL = '';

const WORDMARK = 'Oluja';

export function StudioCredit() {
  const content = (
    <>
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-paper/25 transition-colors duration-500 group-hover:text-paper/45">
        Designed &amp; developed by
      </span>

      <span className="relative mt-2.5 inline-block font-display text-[1.32rem] font-bold uppercase leading-none tracking-[0.3em] text-paper/35 transition-colors duration-500 group-hover:text-paper/55">
        {/* Svjetlo koje izbije izvan slova — ostatak udara, ne sam udar. */}
        <span aria-hidden className="storm-halo pointer-events-none absolute -inset-x-10 -inset-y-8 opacity-0" />

        <span className="relative">{WORDMARK}</span>

        {/*
          Isti tekst preko osnovnog, ali obojen gradijentom kroz masku slova.
          Mora ostati znak za znak jednak gornjem — inače bljesak ne sjedne
          na slova.
        */}
        <span aria-hidden className="storm-flash absolute inset-0">
          {WORDMARK}
        </span>
      </span>
    </>
  );

  /* `studio-credit` nosi animaciju (vidi globals.css), `group` boje iz Tailwinda. */
  const className =
    'studio-credit group relative inline-flex select-none flex-col items-center rounded-lg px-4 py-3 text-center';

  if (STUDIO_URL) {
    return (
      <a href={STUDIO_URL} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return <span className={className}>{content}</span>;
}
