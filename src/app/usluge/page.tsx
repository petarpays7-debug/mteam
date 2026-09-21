import type { Metadata } from 'next';
import { FinalCta } from '@/components/sections/FinalCta';
import { ServicesGrid } from '@/components/sections/ServicesGrid';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/PageHero';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { processSteps } from '@/content/home';
import { photos } from '@/content/photos';
import { elaborates, hepAuthorisation } from '@/content/services';
import { breadcrumbJsonLd, jsonLdGraph, pageMetadata, servicesJsonLd } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Usluge',
  description:
    'Solarne elektrane ključ u ruke, projektiranje i tehnička dokumentacija, inženjering i nadzor, distribucija opreme, tehničko savjetovanje te elektroenergetski elaborati EUEM, EPZ, EMP, EOTRP i OPIP.',
  path: '/usluge',
  image: '/og-usluge.png',
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Usluge"
        title="Cjelovita izvedba ili točno onaj dio koji vam treba."
        lede="M-Team pokriva tehnički, izvedbeni i administrativni dio solarnog projekta. Angažirajte nas za sve faze ili samo za jednu."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/kontakt" icon="arrow-right">
            Zatražite ponudu
          </Button>
          <Button href="#elaborati" variant="outline" icon="chevron-down">
            Elektroenergetski elaborati
          </Button>
        </div>
      </PageHero>

      <section className="py-section" aria-labelledby="popis-usluga">
        <div className="shell">
          <h2 id="popis-usluga" className="sr-only">
            Popis usluga
          </h2>
          <ServicesGrid linkToDetails={false} />

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            <Photo photo={photos.montazaDetalj} ratio="4 / 5" sizes="(min-width: 640px) 30vw, 100vw" />
            <Photo
              photo={photos.elektranaIzZraka}
              ratio="4 / 5"
              sizes="(min-width: 640px) 30vw, 100vw"
            />
            <Photo
              photo={photos.inverterOprema}
              ratio="4 / 5"
              sizes="(min-width: 640px) 30vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section
        id="elaborati"
        className="scroll-mt-24 border-y border-white/10 bg-ink py-section"
        aria-labelledby="elaborati-naslov"
      >
        <div className="shell">
          <SectionHeader
            eyebrow="Elektroenergetski elaborati"
            title={<span id="elaborati-naslov">Dokumentacija za sigurno priključenje na mrežu.</span>}
            lede="Elaborati su preduvjet za tehnički ispravno i propisno priključenje elektrane. Izrađujemo ih za projekte različitih veličina i tipova priključka."
          />

          <Reveal delay={0.06}>
            <p className="mt-8 flex items-start gap-3 rounded-card border border-solar/25 bg-solar/[0.07] px-6 py-5 text-sm leading-relaxed text-paper/80">
              <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-solar" />
              <span>{hepAuthorisation}</span>
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 md:grid-cols-2">
            {elaborates.map((item, index) => (
              <Reveal
                as="li"
                key={item.abbr}
                delay={index * 0.05}
                className="bg-ink p-7 transition-colors duration-500 hover:bg-petrol-900"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-xl font-bold tracking-tight text-solar">
                    {item.abbr}
                  </span>
                  <h3 className="font-display text-[0.98rem] font-semibold leading-snug tracking-tight text-paper">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-paper/55">{item.description}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-section" aria-labelledby="tijek-naslov">
        <div className="shell">
          <SectionHeader
            eyebrow="Tijek suradnje"
            title={<span id="tijek-naslov">Kako izgleda projekt u praksi.</span>}
          />

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <Reveal
                as="li"
                key={step.step}
                delay={index * 0.06}
                className="rounded-card border border-white/10 bg-white/[0.025] p-7"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-solar/35 font-display text-[0.75rem] font-bold text-solar">
                  {step.step}
                </span>
                <h3 className="mt-5 font-display text-[1rem] font-semibold tracking-tight text-paper">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-paper/55">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <FinalCta
        title="Trebate elaborat ili projekt?"
        lede="Opišite lokaciju, planiranu snagu i tip priključka. Javljamo se s opsegom posla i rokom izrade."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbJsonLd([
              { name: 'Početna', path: '/' },
              { name: 'Usluge', path: '/usluge' },
            ]),
            servicesJsonLd(),
          ),
        }}
      />
    </>
  );
}
