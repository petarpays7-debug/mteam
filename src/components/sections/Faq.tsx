import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { faq } from '@/content/faq';

/**
 * Česta pitanja.
 *
 * Koristi izvorni `<details>`/`<summary>`, pa radi bez JavaScripta, otvara se
 * tipkovnicom i pretraživači ga čitaju kao običan tekst. Isti sadržaj ide i u
 * FAQPage strukturirane podatke.
 */
export function Faq() {
  return (
    <section className="aura-solar relative overflow-hidden py-section" aria-labelledby="faq-naslov">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              eyebrow="Česta pitanja"
              title={<span id="faq-naslov">Ono što nas najčešće pitaju.</span>}
              lede="Ako odgovor na vaše pitanje nije ovdje, javite nam se — odgovaramo konkretno i bez obveze."
            />
          </div>

          <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {faq.map((item, index) => (
              <Reveal key={item.question} delay={Math.min(index, 5) * 0.04}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-[1rem] font-semibold leading-snug tracking-tight text-paper transition-colors group-hover:text-solar">
                      {item.question}
                    </h3>
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-paper/60 transition-all duration-300 ease-brand group-hover:border-solar/50 group-hover:text-solar group-open:rotate-45"
                    >
                      <Icon name="plus" className="h-3.5 w-3.5" />
                    </span>
                  </summary>
                  <p className="max-w-prose pb-6 pr-12 text-sm leading-relaxed text-paper/65">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
