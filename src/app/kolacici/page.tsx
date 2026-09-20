import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { company, currentYear } from '@/content/company';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Kolačići',
  description: 'Informacije o kolačićima koje koristi web stranica M-Team d.o.o.',
  path: '/kolacici',
});

export default function CookiesPage() {
  return (
    <>
      <PageHero eyebrow="Pravno" title="Kolačići" lede="Što ova stranica pohranjuje u vašem pregledniku i što se mijenja ako se uvede analitika." />

      <section className="pb-section">
        <div className="shell">
          <div className="max-w-prose">
            {/*
              SADRZAJNI PLACEHOLDER.
              Tekst nize opisuje samo ono sto je tehnicki tocno za ovu
              implementaciju. Prije objave mora ga pregledati i dopuniti
              odgovorna osoba ili pravni savjetnik narucitelja.
            */}
            <p className="rounded-card border border-solar/25 bg-solar/[0.06] px-6 py-5 text-sm leading-relaxed text-paper/75">
              Ovaj tekst je radni predložak. Konačan sadržaj potvrđuje {company.legalName} prije
              objave stranice.
            </p>

            <h2 className="mt-12 font-display text-display-sm">Trenutačno stanje</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Ova stranica u ovoj implementaciji ne postavlja kolačiće za analitiku, oglašavanje ni praćenje posjetitelja. Ne koristi se nijedan vanjski alat za mjerenje prometa.</p>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Preglednik može lokalno pohraniti podatke nužne za osnovni rad stranice. Ti se podaci ne šalju trećim stranama.</p>

            <h2 className="mt-12 font-display text-display-sm">Ako se uvede analitika</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Prije uvođenja bilo kojeg alata za analitiku ili oglašavanje, na stranicu će se dodati obavijest o kolačićima s mogućnošću privole, a ovaj popis bit će dopunjen popisom konkretnih kolačića, njihove svrhe i trajanja.</p>

            <h2 className="mt-12 font-display text-display-sm">Upravljanje kolačićima u pregledniku</h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/65">Postavke kolačića možete u svakom trenutku promijeniti u vlastitom pregledniku — uključujući brisanje već pohranjenih kolačića i blokiranje novih.</p>

            <div className="mt-12 border-t border-white/10 pt-8 text-sm leading-relaxed text-paper/55">
              <p className="font-display font-semibold text-paper/85">Voditelj obrade</p>
              <p className="mt-2">
                {company.legalName}, {company.address.street}, {company.address.postalCode}{' '}
                {company.address.city}
                <br />
                {company.vatIdLabel}: {company.vatId}
                <br />
                E-mail:{' '}
                <a href={company.email.href} className="text-solar underline underline-offset-4">
                  {company.email.display}
                </a>
                <br />
                Telefon:{' '}
                <a href={company.phone.href} className="text-solar underline underline-offset-4">
                  {company.phone.display}
                </a>
              </p>
              <p className="mt-4 text-paper/40">Zadnja izmjena predloška: {currentYear}.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
