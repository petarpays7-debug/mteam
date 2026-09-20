import { Button } from '@/components/ui/Button';
import { mainNav } from '@/content/navigation';
import Link from 'next/link';

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
