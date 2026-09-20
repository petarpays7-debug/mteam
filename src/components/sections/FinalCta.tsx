import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { company } from '@/content/company';

type FinalCtaProps = {
  title?: string;
  lede?: string;
  primaryLabel?: string;
  primaryHref?: string;
  tone?: 'solar' | 'cars';
};

export function FinalCta({
  title = 'Treba vam projekt, oprema ili elaborat?',
  lede = 'Javite nam osnovne podatke o objektu i potrošnji. Vraćamo se s konkretnim prijedlogom sljedećeg koraka.',
  primaryLabel = 'Zatražite ponudu',
  primaryHref = '/kontakt',
  tone = 'solar',
}: FinalCtaProps) {
  return (
    <section className="relative overflow-hidden py-section" aria-labelledby="zavrsni-cta">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            tone === 'cars'
              ? 'radial-gradient(55% 60% at 50% 100%, rgba(201,0,0,0.16), transparent 70%)'
              : 'radial-gradient(55% 60% at 50% 100%, rgba(245,185,0,0.14), transparent 70%)',
        }}
      />

      <div className="shell relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="zavrsni-cta" className="text-display-md">
            {title}
          </h2>
          <p className="lede mx-auto mt-5">{lede}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={primaryHref} size="lg" variant={tone} icon="arrow-right">
              {primaryLabel}
            </Button>
            <Button href={company.phone.href} size="lg" variant="outline" icon="phone">
              Nazovite {company.phone.display}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
