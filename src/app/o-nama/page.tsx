import type { Metadata } from 'next';
import Link from 'next/link';
import { FinalCta } from '@/components/sections/FinalCta';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import {
  aboutIntro,
  aboutLead,
  aboutValues,
  carsAsExtension,
  distribution,
  processFull,
} from '@/content/about';
import { company } from '@/content/company';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'O nama',
  description:
    'M-Team d.o.o. osnovan je 2017. godine i partner je u području obnovljivih izvora energije te razvoja fotonaponskih sustava po principu ključ u ruke.',
  path: '/o-nama',
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="O nama"
        title="Tehnička odgovornost od prve analize do zadnjeg spoja."
        lede={aboutIntro}
      >
        <Button href="/usluge" icon="arrow-right">
          Pogledajte usluge
        </Button>
      </PageHero>

      <section className="py-section" aria-labelledby="pristup-naslov">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal>
              <SectionHeader
                eyebrow="Pristup"
                title={<span id="pristup-naslov">Jedna odgovornost kroz cijeli projekt.</span>}
              />
              <p className="lede mt-6">{aboutLead}</p>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
              <ul className="grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-2">
                {aboutValues.map((value) => (
                  <li key={value.title} className="bg-petrol-800 p-6">
                    <h3 className="font-display text-[0.95rem] font-semibold tracking-tight text-paper">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-paper/55">{value.text}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink py-section" aria-labelledby="proces-cjelovit">
        <div className="shell">
          <SectionHeader
            eyebrow="Kompletan proces"
            title={<span id="proces-cjelovit">Sedam koraka koje preuzimamo na sebe.</span>}
            lede="Klijent ne mora koordinirati više izvođača. Svaka faza ima jasno definiran ishod i osobu koja za njega odgovara."
          />

          <ol className="mt-12 grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {processFull.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                delay={index * 0.05}
                className="relative bg-ink p-7 transition-colors duration-500 hover:bg-petrol-900"
              >
                <span className="font-display text-[0.7rem] font-bold tracking-[0.2em] text-solar">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-[1rem] font-semibold leading-snug tracking-tight text-paper">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-paper/55">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-section" aria-labelledby="distribucija-naslov">
        <div className="shell">
          <SectionHeader
            eyebrow="Distribucija"
            title={<span id="distribucija-naslov">Oprema koju isporučujemo.</span>}
            lede="Uz izvedbu projekata opskrbljujemo i druge izvođače te investitore komponentama za fotonaponske sustave."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {distribution.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 0.06}
                className="rounded-card border border-white/10 bg-white/[0.025] p-7"
              >
                <Icon name="package" className="h-5 w-5 text-solar" />
                <h3 className="mt-5 font-display text-[1.05rem] font-semibold tracking-tight text-paper">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/55">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-section" aria-labelledby="mcars-naslov">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(50% 55% at 20% 40%, rgba(201,0,0,0.13), transparent 70%)',
          }}
        />
        <div className="shell relative">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="eyebrow text-cars-soft">Poslovna cjelina</p>
              <h2 id="mcars-naslov" className="mt-5 text-display-md">
                M-CARS
              </h2>
              <p className="mt-4 font-display text-lg font-semibold text-cars-soft">
                Kvaliteta koju vidiš. Sigurnost koju osjetiš.
              </p>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
              <p className="text-base leading-relaxed text-paper/70">{carsAsExtension}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/mobilnost" variant="cars" icon="arrow-right">
                  Otvorite M-CARS
                </Button>
                <Button href="/mt-mount" variant="outline" icon="arrow-up-right">
                  MT Mount konstrukcije
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-section" aria-labelledby="podaci-naslov">
        <div className="shell">
          <SectionHeader
            eyebrow="Podaci o tvrtki"
            title={<span id="podaci-naslov">{company.legalName}</span>}
          />
          <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="eyebrow-muted">Osnovano</dt>
              <dd className="mt-2 font-display text-lg font-semibold text-paper">
                {company.foundedYear}.
              </dd>
            </div>
            <div>
              <dt className="eyebrow-muted">Sjedište</dt>
              <dd className="mt-2 text-sm leading-relaxed text-paper/70">
                {company.address.street}
                <br />
                {company.address.postalCode} {company.address.city}
              </dd>
            </div>
            <div>
              <dt className="eyebrow-muted">{company.vatIdLabel}</dt>
              <dd className="mt-2 text-sm text-paper/70">{company.vatId}</dd>
            </div>
            <div>
              <dt className="eyebrow-muted">Kontakt</dt>
              <dd className="mt-2 flex flex-col gap-1.5 text-sm">
                <a href={company.phone.href} className="text-paper/70 hover:text-solar">
                  {company.phone.display}
                </a>
                <a href={company.email.href} className="text-paper/70 hover:text-solar">
                  {company.email.display}
                </a>
              </dd>
            </div>
          </dl>

          <p className="mt-10 text-sm text-paper/45">
            Potrebna vam je ponuda ili tehnička provjera?{' '}
            <Link href="/kontakt" className="text-solar underline underline-offset-4">
              Javite nam se
            </Link>
            .
          </p>
        </div>
      </section>

      <FinalCta
        title="Razgovarajmo o vašem objektu."
        lede="Pošaljite osnovne podatke o lokaciji i potrošnji — javit ćemo se s prijedlogom sljedećeg koraka."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Početna', path: '/' },
              { name: 'O nama', path: '/o-nama' },
            ]),
          ),
        }}
      />
    </>
  );
}
