import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { mainNav } from '@/content/navigation';

/*
  Bez ovoga 404 preuzima zadani naslov iz `layout.tsx`, pa u povijesti
  preglednika i alatima izgleda kao obicna stranica.

  `robots` se ovdje ne navodi: Next za not-found sam dodaje `noindex`, a drugi
  `<meta name="robots">` bio bi samo duplikat.
*/
export const metadata: Metadata = {
  title: 'Stranica nije pronađena',
  description: 'Tražena stranica ne postoji ili je premještena.',
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden pt-[var(--header-h)]">
      <div
        aria-hidden
        className="tech-grid pointer-events-none absolute inset-0 opacity-40 mask-fade-b"
      />
      <div className="shell relative">
        <p className="eyebrow">Greška 404</p>
        <h1 className="mt-5 text-display-lg">Ova stranica ne postoji.</h1>
        <p className="lede mt-5">
          Poveznica je možda zastarjela ili je adresa pogrešno upisana. Krenite s početne ili
          odaberite jednu od stranica ispod.
        </p>

        <div className="mt-9">
          <Button href="/" icon="arrow-right">
            Natrag na početnu
          </Button>
        </div>

        <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-8">
          {mainNav.slice(1).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-display text-sm font-medium text-paper/60 transition-colors hover:text-solar"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
