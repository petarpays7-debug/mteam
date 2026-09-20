import type { Metadata } from 'next';
import { CarHeroVisual } from '@/components/sections/CarHeroVisual';
import { FinalCta } from '@/components/sections/FinalCta';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { company } from '@/content/company';
import {
  carsPrinciples,
  eligibleGroups,
  leasingAvailableFor,
  leasingLegalNotice,
  leasingTerms,
  leasingVsLoan,
  minimumConditions,
  repaymentTerms,
} from '@/content/leasing';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'M-CARS — rabljena vozila i leasing',
  description:
    'M-CARS nudi pažljivo odabrana rabljena vozila s jamstvom od 12 mjeseci i urednom servisnom poviješću, uz informativne uvjete leasinga.',
  path: '/mobilnost',
});

export default function CarsPage() {
  return (
    <>
      <PageHero
        eyebrow="Mobilnost"
        tone="cars"
        title="M-CARS"
        lede="Kvaliteta koju vidiš. Sigurnost koju osjetiš."
        visual={<CarHeroVisual />}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/kontakt" variant="cars" size="lg" icon="arrow-right">
            Zatražite ponudu za leasing
          </Button>
          <Button
            href={company.carsListingUrl}
            variant="outline"
            size="lg"
            icon="arrow-up-right"
          >
            Pogledaj ponudu vozila
          </Button>
        </div>
      </PageHero>

      <section className="py-section" aria-labelledby="mcars-uvod">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <Reveal>
              <h2 id="mcars-uvod" className="text-display-md">
                Vozila koja prođu provjeru prije nego uđu u ponudu.
              </h2>
            </Reveal>
            <Reveal direction="right" delay={0.08}>
              <p className="text-base leading-relaxed text-paper/70 sm:text-lg">
                M-CARS nudi pažljivo odabrana rabljena vozila s jamstvom i urednom servisnom
                poviješću. Svako vozilo prolazi detaljan pregled prije prodaje.
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {carsPrinciples.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.07}
                className="group relative overflow-hidden rounded-card border border-white/10 bg-white/[0.025] p-7 transition-colors duration-500 hover:border-cars-soft/40"
              >
                <div
                  aria-hidden
                  className="tech-grid pointer-events-none absolute inset-0 bg-grid-sm opacity-40 mask-fade-b"
                />
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-cars-soft">
                  <Icon name="shield" className="h-5 w-5" />
                </span>
                <h3 className="relative mt-6 font-display text-[1.05rem] font-semibold tracking-tight text-paper">
                  {item.title}
                </h3>
                <p className="relative mt-2.5 text-sm leading-relaxed text-paper/60">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-white/10 bg-ink py-section"
        aria-labelledby="leasing-naslov"
      >
        <div className="shell">
          <SectionHeader
            eyebrow="Leasing bez učešća"
            title={<span id="leasing-naslov">Vaš automobil. Bez velikog početnog ulaganja.</span>}
            lede="Uvjeti navedeni na ovoj stranici su informativni i ovise o odobrenju leasing društva."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <Reveal>
              <ul className="flex flex-col gap-4">
                {leasingTerms.map((term) => (
                  <li key={term} className="flex items-start gap-3.5">
                    <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-cars-soft" />
                    <span className="text-sm leading-relaxed text-paper/70">{term}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 rounded-card border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-paper/65">
                {leasingVsLoan}
              </p>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
              <h3 className="font-display text-display-sm">Maksimalni rokovi otplate</h3>
              <div className="mt-6 overflow-hidden rounded-card border border-white/10">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Maksimalni rok otplate leasinga prema godištu vozila
                  </caption>
                  <thead>
                    <tr className="bg-white/[0.05]">
                      <th scope="col" className="px-5 py-3.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-paper/60">
                        Godište vozila
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-paper/60">
                        Rok otplate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {repaymentTerms.map((row) => (
                      <tr key={row.year} className="border-t border-white/8">
                        <td className="px-5 py-3.5 text-paper/70">{row.year}</td>
                        <td className="px-5 py-3.5 font-display font-semibold text-paper">
                          {row.months}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="mt-10 font-display text-display-sm">Leasing je dostupan</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {leasingAvailableFor.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-white/12 bg-white/[0.03] px-4 py-2 text-[0.8rem] text-paper/65"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-section" aria-labelledby="uvjeti-naslov">
        <div className="shell">
          <SectionHeader
            eyebrow="Minimalni uvjeti"
            title={<span id="uvjeti-naslov">Uvjeti za fizičke osobe.</span>}
            lede="Konačnu odluku o odobrenju donosi leasing društvo na temelju cjelovite dokumentacije."
          />

          <dl className="mt-12 grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 md:grid-cols-2">
            {minimumConditions.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.05}
                className="bg-petrol-800 p-7 transition-colors duration-500 hover:bg-petrol-700"
              >
                <dt className="font-display text-[1rem] font-semibold tracking-tight text-paper">
                  {item.title}
                </dt>
                <dd className="mt-2.5 text-sm leading-relaxed text-paper/60">{item.text}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-white/10 py-section" aria-labelledby="tko-naslov">
        <div className="shell">
          <SectionHeader
            eyebrow="Informativno"
            title={<span id="tko-naslov">Tko može koristiti leasing?</span>}
          />

          <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {eligibleGroups.map((group, index) => (
              <Reveal
                as="li"
                key={group}
                delay={index * 0.04}
                className="flex items-start gap-3 border-b border-white/8 pb-4"
              >
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-cars-soft" />
                <span className="text-sm leading-relaxed text-paper/65">{group}</span>
              </Reveal>
            ))}
          </ul>

          {/* Obavezna pravna napomena - ne uklanjati i ne skracivati. */}
          <Reveal delay={0.1}>
            <p className="mt-12 rounded-card border border-white/12 bg-white/[0.03] p-6 text-sm leading-relaxed text-paper/60">
              <strong className="font-display font-semibold text-paper/85">Napomena: </strong>
              {leasingLegalNotice}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={company.carsListingUrl} variant="cars" icon="arrow-up-right">
                Pogledaj ponudu vozila
              </Button>
              <Button href={company.phone.href} variant="outline" icon="phone">
                {company.phone.display}
              </Button>
            </div>
            <p className="mt-4 text-[0.78rem] text-paper/40">
              Ponuda vozila vodi se na vanjskom oglasniku i otvara se u novoj kartici.
            </p>
          </Reveal>
        </div>
      </section>

      <FinalCta
        tone="cars"
        title="Zanima vas konkretno vozilo?"
        lede="Javite nam koje vozilo razmatrate i kakav način financiranja vam odgovara — provjerit ćemo mogućnosti."
        primaryLabel="Kontaktirajte nas"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Početna', path: '/' },
              { name: 'M-CARS', path: '/mobilnost' },
            ]),
          ),
        }}
      />
    </>
  );
}
