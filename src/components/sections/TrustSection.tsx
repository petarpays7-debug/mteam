import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { trustPoints } from '@/content/home';

/**
 * Sekcija povjerenja prikazuje iskljucivo provjerljive cinjenice.
 * Namjerno nema logotipa partnera, brojeva instalacija ni recenzija.
 */
export function TrustSection() {
  return (
    <section className="relative border-y border-white/10 bg-ink py-section" aria-labelledby="povjerenje-naslov">
      <div className="shell">
        <SectionHeader
          eyebrow="Povjerenje"
          title={<span id="povjerenje-naslov">Partner za energiju budućnosti.</span>}
          lede="Ono što možemo potvrditi navodimo. Ono što ovisi o konkretnom projektu jasno označavamo kao takvo."
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {trustPoints.map((point, index) => (
            <Reveal
              as="li"
              key={point.title}
              delay={index * 0.05}
              className="bg-ink p-7 transition-colors duration-500 hover:bg-petrol-900"
            >
              <Icon name="check" className="h-5 w-5 text-solar" />
              <h3 className="mt-5 font-display text-[1rem] font-semibold tracking-tight text-paper">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper/55">{point.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
