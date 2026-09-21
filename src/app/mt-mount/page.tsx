import type { Metadata } from 'next';
import { MountExplorer } from '@/components/sections/MountExplorer';
import { FinalCta } from '@/components/sections/FinalCta';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/Section';
import { company } from '@/content/company';
import { mountAdvantages } from '@/content/mount';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'MT Mount by Enerack — solarne konstrukcije',
  description:
    'Konstrukcije i nosači za solarne panele: kosi i limeni krov, ravni krov, ground mount, carporti i solarne ograde. M-Team je distributer Enerack konstrukcija.',
  path: '/mt-mount',
  image: '/og-mt-mount.png',
});

export default function MountPage() {
  return (
    <>
      <PageHero
        eyebrow="Konstrukcije"
        tone="mount"
        title="MT Mount by Enerack"
        lede="Solarne konstrukcije i nosači za panele, od obiteljskih kuća do velikih solarnih projekata."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/kontakt" icon="arrow-right">
            Zatražite ponudu za konstrukciju
          </Button>
          <Button href="#tipovi" variant="outline" icon="chevron-down">
            Tipovi konstrukcija
          </Button>
        </div>

        {/* Odnos distributer - proizvodjac mora biti jasno naveden. */}
        <p className="mt-8 flex max-w-xl items-start gap-3 rounded-card border border-white/12 bg-white/[0.03] px-5 py-4 text-sm leading-relaxed text-paper/65">
          <Icon name="package" className="mt-0.5 h-5 w-5 shrink-0 text-petrol-100" />
          <span>
            {company.legalName} djeluje kao službeni distributer, dok {company.mountManufacturer}{' '}
            predstavlja proizvođača konstrukcija.
          </span>
        </p>
      </PageHero>

      <section id="tipovi" className="scroll-mt-24 py-section" aria-labelledby="tipovi-naslov">
        <div className="shell">
          <SectionHeader
            eyebrow="Tipovi konstrukcija"
            title={<span id="tipovi-naslov">Odaberite podlogu — prikaz i opis se mijenjaju.</span>}
            lede="Svaki tip krova ili terena traži drugačiji način pričvršćenja, nagib i raspored nosača."
          />

          <div className="mt-12">
            <MountExplorer />
          </div>
        </div>
      </section>

      <section
        className="border-y border-white/10 bg-ink py-section"
        aria-labelledby="prednosti-naslov"
      >
        <div className="shell">
          <SectionHeader
            eyebrow="Zašto MT Mount"
            title={<span id="prednosti-naslov">Konstrukcije koje nose energiju budućnosti.</span>}
          />

          <ul className="mt-12 grid gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {mountAdvantages.map((item, index) => (
              <Reveal
                as="li"
                key={item.title}
                delay={index * 0.05}
                className="bg-ink p-7 transition-colors duration-500 hover:bg-petrol-900"
              >
                <Icon name="check" className="h-5 w-5 text-solar" />
                <h3 className="mt-5 font-display text-[1rem] font-semibold tracking-tight text-paper">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/55">{item.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta
        title="Trebate konstrukciju za konkretan objekt?"
        lede="Pošaljite tip krova, dimenzije i broj modula — pripremit ćemo prijedlog sustava i ponudu."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Početna', path: '/' },
              { name: 'MT Mount', path: '/mt-mount' },
            ]),
          ),
        }}
      />
    </>
  );
}
