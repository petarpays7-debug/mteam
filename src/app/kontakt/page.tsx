import type { Metadata } from 'next';
import { ContactForm } from '@/components/sections/ContactForm';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { company, formattedAddress } from '@/content/company';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Kontakt',
  description:
    'Kontaktirajte M-Team d.o.o. — Osječka 188, 31431 Čepin. Telefon +385 98 963 0165, e-mail info@m-team.hr.',
  path: '/kontakt',
});

const details = [
  { icon: 'pin' as const, label: 'Adresa', value: formattedAddress, href: undefined },
  {
    icon: 'phone' as const,
    label: 'Mobitel',
    value: company.phone.display,
    href: company.phone.href,
  },
  {
    icon: 'mail' as const,
    label: 'E-mail',
    value: company.email.display,
    href: company.email.href,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Recite nam što planirate."
        lede="Za ponudu, elaborat ili tehničku provjeru — javite nam osnovne podatke i vraćamo se s konkretnim prijedlogom."
      />

      <section className="pb-section" aria-labelledby="kontakt-naslov">
        <div className="shell">
          <h2 id="kontakt-naslov" className="sr-only">
            Kontaktni podaci i obrazac
          </h2>

          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <Reveal>
              <div className="rounded-card border border-white/10 bg-white/[0.025] p-7 sm:p-8">
                <h3 className="font-display text-display-sm">{company.legalName}</h3>

                <dl className="mt-8 flex flex-col gap-6">
                  {details.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/12 text-solar">
                        <Icon name={item.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <dt className="eyebrow-muted">{item.label}</dt>
                        <dd className="mt-1.5 text-[0.95rem] text-paper/80">
                          {item.href ? (
                            <a href={item.href} className="transition-colors hover:text-solar">
                              {item.value}
                            </a>
                          ) : (
                            item.value
                          )}
                        </dd>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/12 text-solar">
                      <Icon name="document" className="h-5 w-5" />
                    </span>
                    <div>
                      <dt className="eyebrow-muted">{company.vatIdLabel}</dt>
                      <dd className="mt-1.5 text-[0.95rem] text-paper/80">{company.vatId}</dd>
                    </div>
                  </div>
                </dl>

                <div className="hairline my-8" />

                <div className="flex flex-col gap-3">
                  <a
                    href={company.phone.href}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-solar font-display text-sm font-semibold text-petrol-900 transition-all duration-300 hover:bg-solar-soft"
                  >
                    <Icon name="phone" className="h-4 w-4" />
                    Nazovite odmah
                  </a>
                  <a
                    href={company.email.href}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 font-display text-sm font-semibold text-paper transition-colors hover:border-solar/50 hover:text-solar"
                  >
                    <Icon name="mail" className="h-4 w-4" />
                    Pošaljite e-mail
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
              <ContactForm />
              <p className="mt-5 text-[0.8rem] leading-relaxed text-paper/40">
                Podatke iz obrasca koristimo isključivo za odgovor na vaš upit. Ako slanje putem
                obrasca nije dostupno, koristite telefon ili e-mail.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Početna', path: '/' },
              { name: 'Kontakt', path: '/kontakt' },
            ]),
          ),
        }}
      />
    </>
  );
}
